import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Beaker, Info } from 'lucide-react-native';
import {
  Batch,
  BrewItem,
  getBatchById,
  getBrewItemsByBatchId,
} from '../../src/database/db';

export default function BatchDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const batchId = Number(id);
  const [items, setItems] = useState<BrewItem[]>([]);
  const [batch, setBatch] = useState<Batch | null>(null);

  useEffect(() => {
    if (!Number.isFinite(batchId)) {
      setBatch(null);
      setItems([]);
      return;
    }

    setBatch(getBatchById(batchId));
    setItems(getBrewItemsByBatchId(batchId));
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

  return (
    <ScrollView className="flex-1 bg-[#121212]">
      <Stack.Screen options={{ title: batch.name }} />

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
        {!!batch.methodGroup && (
          <Text className="text-gray-500">Method: {batch.methodGroup}</Text>
        )}
      </View>

      <View className="p-4">
        <Text className="text-white font-bold mb-4">Sub-Batch Comparison</Text>

        {items.map((item) => (
          <View
            key={item.id}
            className="bg-[#1E1E1E] rounded-2xl p-4 mb-4 border border-[#333]"
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white font-bold text-lg">
                  {item.label}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {item.duration} Hours Extraction
                </Text>
                {!!item.harvestTime && (
                  <Text className="text-gray-500 text-xs">
                    Harvest Time: {item.harvestTime}
                  </Text>
                )}
              </View>
              <View className="items-end">
                <Text
                  className={`text-2xl font-black ${getGradeColor(item.totalScore)}`}
                >
                  {item.totalScore}
                </Text>
                <Text className="text-[10px] text-gray-600 uppercase font-bold">
                  Total Score
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between bg-[#121212] p-3 rounded-xl mb-4">
              <View className="items-center flex-1">
                <Text className="text-gray-500 text-[10px] uppercase">
                  Aroma
                </Text>
                <Text className="text-white font-bold">{item.fragrance}</Text>
              </View>
              <View className="items-center flex-1 border-x border-[#333]">
                <Text className="text-gray-500 text-[10px] uppercase">
                  Acid
                </Text>
                <Text className="text-white font-bold">{item.acidity}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-500 text-[10px] uppercase">
                  Sweet
                </Text>
                <Text className="text-white font-bold">{item.sweetness}</Text>
              </View>
              <View className="items-center flex-1 border-l border-[#333]">
                <Text className="text-gray-500 text-[10px] uppercase">
                  Body
                </Text>
                <Text className="text-white font-bold">{item.mouthfeel}</Text>
              </View>
            </View>

            {item.notes ? (
              <View className="flex-row bg-[#252525] p-3 rounded-lg">
                <Info size={14} stroke="#666" />
                <Text className="text-gray-400 text-xs ml-2 flex-1 italic">
                  "{item.notes}"
                </Text>
              </View>
            ) : null}
          </View>
        ))}

        {!items.length && (
          <Text className="text-gray-500 text-center mt-6">
            Belum ada sub-batch untuk batch ini.
          </Text>
        )}
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
