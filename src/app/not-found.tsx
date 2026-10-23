import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">ページが見つかりません</h1>
      <Link href="/" className="underline">
        ホームへ戻る
      </Link>
    </main>
  );
}
