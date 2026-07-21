export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white md:bg-gray-100 md:flex md:justify-center md:py-10">
      <div className="w-full md:max-w-md md:rounded-3xl md:shadow-2xl md:bg-white md:overflow-hidden">
        {children}
      </div>
    </div>
  )
}
