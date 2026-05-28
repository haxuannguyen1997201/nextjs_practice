import type { Metadata } from 'next';
import StoreProvider from '../src/store/StoreProvider';
import '../src/index.css';
import '../src/App.css';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Product shop',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <div id="root">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
