export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Offline Mode</h1>
        <p className="mb-4">
          You are currently offline. The map will continue to work with cached data.
        </p>
        <p className="text-gray-600">
          You can still use the app with cached map data. Some features may be limited.
        </p>
      </div>
    </div>
  );
}
