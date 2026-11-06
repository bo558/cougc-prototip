// Statik export: bu detay sayfasının tüm olası kimlikleri derlemede üretilir (bkz. lib/static-params.ts).
// Ekranın kendisi istemci bileşeni olarak view.tsx içindedir.
import { brandParams } from '@/lib/static-params';
import View from './view';

export const dynamicParams = false;
export const generateStaticParams = brandParams;

export default function Page() {
  return <View />;
}
