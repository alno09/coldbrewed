import { useLocalSearchParams, Stack } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Beaker, Info, Trash2 } from 'lucide-react-native';
import {
  Batch,
  BrewItem,
  deleteBatch,
  getBatchById,
  getBrewItemsByBatchId,
  updateBatchMethodGroup,
  updateBrewItem,
} from '../../src/database/db';
import { useRouter } from 'expo-router';

type ScoreField =
  | 'fragrance'
  | 'acidity'
  | 'sweetness'
  | 'mouthfeel'
  | 'aftertaste';

type BrewItemDraft = {
  id: number;
  label: string;
  duration: number;
  harvestTime: string;
  fragrance: number;
  acidity: number;
  sweetness: number;
  mouthfeel: number;
  aftertaste: number;
  notes: string;
};

const scoreLabels: Record<ScoreField, string> = {
  fragrance: 'Aroma',
  acidity: 'Acidity',
  sweetness: 'Sweetness',
  mouthfeel: 'Body',
  aftertaste: 'Aftertaste',
};

const scoreFields: ScoreField[] = [
  'fragrance',
  'acidity',
  'sweetness',
  'mouthfeel',
  'aftertaste',
];

export default function BatchDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const batchId = Number(id);
  const router = useRouter();
  const [items, setItems] = useState<BrewItem[]>([]);
  const [draftItems, setDraftItems] = useState<BrewItemDraft[]>([]);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [methodGroup, setMethodGroup] = useState('');

  useEffect(() => {
    if (!Number.isFinite(batchId)) {
      setBatch(null);
      setItems([]);
      setDraftItems([]);
      return;
    }

    const batchData = getBatchById(batchId);
    const brewItems = getBrewItemsByBatchId(batchId);

    setBatch(batchData);
    setMethodGroup(batchData?.methodGroup ?? '');
    setItems(brewItems);
    setDraftItems(
      brewItems.map((item) => ({
        id: item.id,
        label: item.label,
        duration: item.duration,
        harvestTime: item.harvestTime,
        fragrance: item.fragrance,
        acidity: item.acidity,
        sweetness: item.sweetness,
        mouthfeel: item.mouthfeel,
        aftertaste: item.aftertaste,
        notes: item.notes,
      }))
    );
  }, [batchId]);

  if (!batch) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center px-6">
        <Text className="text-gray-500 text-center">
          Batch tidak ditemukan.
        </Text>
      </View>
    );
  }

  const getGradeColor = (score: number) => {
    if (score >= 40) return 'text-gold';
    if (score >= 30) return 'text-green-500';
    return 'text-red-500';
  };

  const updateDraftItem = <K extends keyof BrewItemDraft>(
    itemId: number,
    key: K,
    value: BrewItemDraft[K]
  ) => {
    setDraftItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, [key]: value } : item))
    );
  };

  const handleSaveMethodGroup = () => {
    const result = updateBatchMethodGroup(batchId, methodGroup);

    if (!result.success) {
      Alert.alert('Error', 'Method cold brew gagal disimpan.');
      return;
    }

    setBatch((current) =>
      current ? { ...current, methodGroup: methodGroup.trim() } : current
    );
    Alert.alert('Success', 'Method cold brew berhasil diperbarui.');
  };

  const handleSaveItem = (draft: BrewItemDraft) => {
    const result = updateBrewItem({
      ...draft,
      totalScore:
        draft.fragrance +
        draft.acidity +
        draft.sweetness +
        draft.mouthfeel +
        draft.aftertaste,
    });

    if (!result.success) {
      Alert.alert('Error', 'Perubahan sub-batch gagal disimpan.');
      return;
    }

    const refreshedItems = getBrewItemsByBatchId(batchId);
    setItems(refreshedItems);
    setDraftItems(
      refreshedItems.map((item) => ({
        id: item.id,
        label: item.label,
        duration: item.duration,
        harvestTime: item.harvestTime,
        fragrance: item.fragrance,
        acidity: item.acidity,
        sweetness: item.sweetness,
        mouthfeel: item.mouthfeel,
        aftertaste: item.aftertaste,
        notes: item.notes,
      }))
    );
    Alert.alert('Success', 'Sub-batch berhasil diperbarui.');
  };

  const handleDeleteBatch = () => {
    const result = deleteBatch(batchId);

    if (!result.success) {
      Alert.alert('Error', 'Batch gagal dihapus.');
      return;
    }

    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#121212]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-[#121212]"
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <Stack.Screen
          options={{
            title: batch.name,
            headerRight: () => (
              <TouchableOpacity onPress={handleDeleteBatch} className="p-1">
                <Trash2 size={18} stroke="#F5B7B1" />
              </TouchableOpacity>
            ),
          }}
        />

        <View className="p-6 bg-[#1E1E1E] border-b border-[#333]">
          <View className="flex-row items-center mb-2">
            <Beaker size={20} stroke="#D4AF37" />
            <Text className="text-gray-400 ml-2 uppercase tracking-widest text-xs">
              Recipe Specs
            </Text>
          </View>
          <Text className="text-white text-xl font-bold mb-1">{batch.beans}</Text>
          <Text className="text-gray-500 italic">
            Ratio {batch.ratio || '-'} | {batch.date || 'Semarang Station'}
          </Text>
          {!!batch.water && (
            <Text className="text-gray-500 mt-2">Water: {batch.water}</Text>
          )}
          <Text className="text-gray-500 mt-4 mb-2 text-[10px] uppercase tracking-widest">
            Cold Brew Method
          </Text>
          <TextInput
            className="bg-[#121212] text-white p-3 rounded-xl"
            placeholder="e.g. Full Fridge, Half Bloom"
            placeholderTextColor="#666"
            value={methodGroup}
            onChangeText={setMethodGroup}
          />
          <TouchableOpacity
            onPress={handleSaveMethodGroup}
            className="self-start mt-3 px-4 py-2 rounded-lg bg-coffee"
          >
            <Text className="text-white font-semibold">Save Method</Text>
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <Text className="text-white font-bold mb-4">Sub-Batch Editor</Text>

          {draftItems.map((draft) => {
            const totalScore =
              draft.fragrance +
              draft.acidity +
              draft.sweetness +
              draft.mouthfeel +
              draft.aftertaste;
            const savedItem = items.find((item) => item.id === draft.id);

            return (
              <View
                key={draft.id}
                className="bg-[#1E1E1E] rounded-2xl p-4 mb-4 border border-[#333]"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-1 pr-4">
                    <TextInput
                      className="text-white font-bold text-lg"
                      value={draft.label}
                      onChangeText={(value) =>
                        updateDraftItem(draft.id, 'label', value)
                      }
                    />
                    <TextInput
                      className="text-gray-500 text-xs mt-2"
                      keyboardType="numeric"
                      value={String(draft.duration)}
                      onChangeText={(value) =>
                        updateDraftItem(draft.id, 'duration', Number(value) || 0)
                      }
                    />
                    <TextInput
                      className="text-gray-500 text-xs mt-2"
                      placeholder="Harvest Time"
                      placeholderTextColor="#666"
                      value={draft.harvestTime}
                      onChangeText={(value) =>
                        updateDraftItem(draft.id, 'harvestTime', value)
                      }
                    />
                  </View>
                  <View className="items-end">
                    <Text
                      className={`text-2xl font-black ${getGradeColor(totalScore)}`}
                    >
                      {totalScore}
                    </Text>
                    <Text className="text-[10px] text-gray-600 uppercase font-bold">
                      Total Score
                    </Text>
                  </View>
                </View>

                <View className="bg-[#121212] p-3 rounded-xl mb-4">
                  <View className="flex-row flex-wrap justify-between">
                    {scoreFields.map((field) => (
                      <View key={field} className="w-[48%] mb-3">
                        <Text className="text-gray-500 text-[10px] uppercase mb-1">
                          {scoreLabels[field]}
                        </Text>
                        <TextInput
                          className="bg-[#1E1E1E] text-white p-3 rounded-lg"
                          keyboardType="numeric"
                          value={String(draft[field])}
                          onChangeText={(value) =>
                            updateDraftItem(
                              draft.id,
                              field,
                              Number(value) || 0
                            )
                          }
                        />
                      </View>
                    ))}
                  </View>
                </View>

                <TextInput
                  className="bg-[#252525] p-3 rounded-lg text-gray-300 mb-4"
                  placeholder="Notes"
                  placeholderTextColor="#666"
                  multiline
                  value={draft.notes}
                  onChangeText={(value) =>
                    updateDraftItem(draft.id, 'notes', value)
                  }
                />

                {savedItem?.notes ? (
                  <View className="flex-row bg-[#252525] p-3 rounded-lg mb-4">
                    <Info size={14} stroke="#666" />
                    <Text className="text-gray-400 text-xs ml-2 flex-1 italic">
                      "{savedItem.notes}"
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => handleSaveItem(draft)}
                  className="self-start px-4 py-2 rounded-lg bg-coffee"
                >
                  <Text className="text-white font-semibold">
                    Save Sub-Batch
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {!draftItems.length && (
            <Text className="text-gray-500 text-center mt-6">
              Belum ada sub-batch untuk batch ini.
            </Text>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
