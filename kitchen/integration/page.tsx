import { SystemBridge } from '../components/integration/SystemBridge';

export default function IntegrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Integration</h1>
        <p className="text-gray-600 mt-2">
          Manage integration between Kitchen Module and Event Menu Planner
        </p>
      </div>
      
      <SystemBridge />
    </div>
  );
}