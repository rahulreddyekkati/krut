import React from 'react';
import { View, Text } from 'react-native';

export default function MarketsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Markets</Text>
      <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>Coming soon</Text>
    </View>
  )
}
