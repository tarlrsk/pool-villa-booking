export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-white">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">กำลังโหลด...</p>
    </div>
  )
}
