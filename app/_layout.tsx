// app/_layout.tsx
import { Stack } from 'expo-router';
import { initDB } from '../src/database/db';
import '../global.css';

export default function Layout() {
  initDB();

  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: '#121212' },
      headerTintColor: '#fff',
      contentStyle: { backgroundColor: '#121212' } 
    }}>
      <Stack.Screen name="index" options={{ title: "My Batches" }} />
    </Stack>
  );
}
