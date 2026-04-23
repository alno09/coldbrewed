import { Link } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { Coffee, ChevronRight } from 'lucide-react-native';

interface Props {
  id: number;
  name: string;
  beans: string;
  ratio: string;
  onPress?: () => void;
}

export default function BatchCard({ id, name, beans, ratio, onPress }: Props) {
  return (
    <Link href={`/brew/${id}`} asChild>
      <TouchableOpacity
        onPress={onPress}
        className="bg-[#1E1E1E] p-4 rounded-2xl mb-4 border-l-4 border-coffee flex-row justify-between items-center"
      >
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Coffee size={16} stroke="#D4AF37" />
            <Text className="text-white font-bold ml-2 text-lg">{name}</Text>
          </View>
          <Text className="text-gray-400 text-sm italic">{beans}</Text>
          <View className="bg-[#2D2D2D] self-start px-2 py-0.5 rounded mt-2">
            <Text className="text-gray-300 text-[10px]">Ratio {ratio}</Text>
          </View>
        </View>
        <ChevronRight stroke="#444" size={20} />
      </TouchableOpacity>
    </Link>
  );
}
