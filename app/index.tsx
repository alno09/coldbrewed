import { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import BatchCard from '../src/components/BatchCard';
import { Batch, getAllBatches } from '../src/database/db';

export default function Dashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const isFocused = useIsFocused();
  const router = useRouter();

  useEffect(() => {
    if (isFocused) {
      setBatches(getAllBatches());
    }
  }, [isFocused]);

  return (
    <View className="flex-1 bg-[#121212] p-4">
      <FlatList
        data={batches}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text className="text-gray-600 text-center mt-10">
            Belum ada batch. Klik + untuk mulai seduh.
          </Text>
        }
        renderItem={({ item }) => (
          <BatchCard
            id={item.id}
            name={item.name}
            beans={item.beans}
            ratio={item.ratio}
          />
        )}
      />

      <TouchableOpacity
        onPress={() => router.push('/add-batch')}
        className="absolute bottom-10 right-6 bg-coffee w-16 h-16 rounded-full items-center justify-center shadow-2xl"
      >
        <Plus stroke="white" size={32} />
      </TouchableOpacity>
    </View>
  );
}
