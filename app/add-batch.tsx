import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  NewBatchInput,
  NewBrewItemInput,
  saveCompleteBatch,
} from '../src/database/db';
import { Save, PlusCircle } from 'lucide-react-native';

type ScoreField =
  | 'fragrance'
  | 'acidity'
  | 'sweetness'
  | 'mouthfeel'
  | 'aftertaste';

type BrewItemDraft = Required<
  Pick<
    NewBrewItemInput,
    | 'label'
    | 'duration'
    | 'harvestTime'
    | 'fragrance'
    | 'acidity'
    | 'sweetness'
    | 'mouthfeel'
    | 'aftertaste'
    | 'notes'
  >
>;

const scoreFields: ScoreField[] = [
  'fragrance',
  'acidity',
  'sweetness',
  'mouthfeel',
  'aftertaste',
];

const createEmptySubBatch = (): BrewItemDraft => ({
  label: 'Baris Depan - Kiri',
  duration: 18,
  harvestTime: '',
  fragrance: 0,
  acidity: 0,
  sweetness: 0,
  mouthfeel: 0,
  aftertaste: 0,
  notes: '',
});

export default function AddBatch() {
  const router = useRouter();
  const [batchForm, setBatchForm] = useState<Required<NewBatchInput>>({
    name: 'BATCH 1: GAYO WINEY R&D',
    date: '',
    beans: 'Gayo Wine (Medium Roast)',
    ratio: '1:10',
    water: '',
    methodGroup: 'Cold Brew',
  });
  const [subBatches, setSubBatches] = useState<BrewItemDraft[]>([
    createEmptySubBatch(),
  ]);

  const updateBatchField = <K extends keyof Required<NewBatchInput>>(
    key: K,
    value: Required<NewBatchInput>[K]
  ) => {
    setBatchForm((current) => ({ ...current, [key]: value }));
  };

  const updateSubBatchField = <K extends keyof BrewItemDraft>(
    index: number,
    key: K,
    value: BrewItemDraft[K]
  ) => {
    setSubBatches((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  };

  const handleSave = () => {
    if (!batchForm.name.trim() || !batchForm.beans.trim()) {
      Alert.alert('Error', 'Isi dulu nama batch dan bijinya!');
      return;
    }

    const processedItems: NewBrewItemInput[] = subBatches.map((item) => ({
      ...item,
      totalScore:
        item.fragrance +
        item.acidity +
        item.sweetness +
        item.mouthfeel +
        item.aftertaste,
    }));

    const result = saveCompleteBatch(batchForm, processedItems);

    if (!result.success) {
      Alert.alert('Error', 'Data gagal disimpan. Coba lagi.');
      return;
    }

    Alert.alert('Success', 'Data R&D berhasil disimpan ke SQLite!');
    router.replace('/');
  };

  return (
    <ScrollView className="flex-1 bg-[#121212] p-4">
      <Text className="text-gray-500 mb-4 uppercase tracking-widest text-xs font-bold">
        Main Batch Info
      </Text>

      <View className="bg-[#1E1E1E] p-4 rounded-2xl mb-6">
        <TextInput
          className="text-white text-xl font-bold mb-4 border-b border-[#333] pb-2"
          placeholder="Batch Name"
          placeholderTextColor="#666"
          value={batchForm.name}
          onChangeText={(value) => updateBatchField('name', value)}
        />
        <TextInput
          className="text-gray-300 mb-4 border-b border-[#333] pb-2"
          placeholder="Beans Origin"
          placeholderTextColor="#666"
          value={batchForm.beans}
          onChangeText={(value) => updateBatchField('beans', value)}
        />
        <TextInput
          className="text-gray-300 mb-4 border-b border-[#333] pb-2"
          placeholder="Ratio (e.g. 1:10)"
          placeholderTextColor="#666"
          value={String(batchForm.ratio)}
          onChangeText={(value) => updateBatchField('ratio', value)}
        />
        <TextInput
          className="text-gray-300 mb-4 border-b border-[#333] pb-2"
          placeholder="Date / Roast Date"
          placeholderTextColor="#666"
          value={batchForm.date}
          onChangeText={(value) => updateBatchField('date', value)}
        />
        <TextInput
          className="text-gray-300 mb-4 border-b border-[#333] pb-2"
          placeholder="Water"
          placeholderTextColor="#666"
          value={batchForm.water}
          onChangeText={(value) => updateBatchField('water', value)}
        />
        <TextInput
          className="text-gray-300 border-b border-[#333] pb-2"
          placeholder="Method Group"
          placeholderTextColor="#666"
          value={batchForm.methodGroup}
          onChangeText={(value) => updateBatchField('methodGroup', value)}
        />
      </View>

      <Text className="text-gray-500 mb-4 uppercase tracking-widest text-xs font-bold">
        Sub-Batches (R&D Items)
      </Text>

      {subBatches.map((sb, index) => (
        <View
          key={`${sb.label}-${index}`}
          className="bg-[#1E1E1E] p-4 rounded-2xl mb-4 border border-[#2d2d2d]"
        >
          <TextInput
            className="text-gold font-bold mb-3"
            value={sb.label}
            onChangeText={(value) => updateSubBatchField(index, 'label', value)}
          />
          <TextInput
            className="bg-[#121212] text-white p-3 rounded-lg mb-3"
            keyboardType="numeric"
            placeholder="Duration (hours)"
            placeholderTextColor="#444"
            value={String(sb.duration)}
            onChangeText={(value) =>
              updateSubBatchField(index, 'duration', Number(value) || 0)
            }
          />
          <TextInput
            className="bg-[#121212] text-white p-3 rounded-lg mb-3"
            placeholder="Harvest Time"
            placeholderTextColor="#444"
            value={sb.harvestTime}
            onChangeText={(value) =>
              updateSubBatchField(index, 'harvestTime', value)
            }
          />
          <View className="flex-row flex-wrap justify-between">
            {scoreFields.map((attr) => (
              <View key={attr} className="w-[48%] mb-2">
                <Text className="text-gray-500 text-[10px] uppercase">
                  {attr}
                </Text>
                <TextInput
                  className="bg-[#121212] text-white p-2 rounded-lg mt-1"
                  keyboardType="numeric"
                  placeholder="0-10"
                  placeholderTextColor="#444"
                  value={String(sb[attr])}
                  onChangeText={(value) =>
                    updateSubBatchField(index, attr, Number(value) || 0)
                  }
                />
              </View>
            ))}
          </View>
          <TextInput
            className="bg-[#121212] text-white p-3 rounded-lg mt-3"
            placeholder="Notes"
            placeholderTextColor="#444"
            multiline
            value={sb.notes}
            onChangeText={(value) => updateSubBatchField(index, 'notes', value)}
          />
        </View>
      ))}

      <TouchableOpacity
        onPress={() =>
          setSubBatches((current) => [
            ...current,
            {
              ...createEmptySubBatch(),
              label: `Sub-Batch ${current.length + 1}`,
            },
          ])
        }
        className="flex-row items-center justify-center p-4 border-2 border-dashed border-[#333] rounded-2xl mb-6"
      >
        <PlusCircle size={20} stroke="#666" />
        <Text className="text-gray-500 ml-2">Add Another Sub-Batch</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSave}
        className="bg-coffee p-5 rounded-2xl items-center flex-row justify-center mb-10"
      >
        <Save size={20} stroke="white" />
        <Text className="text-white font-bold ml-2">SAVE ALL EXPERIMENTS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
