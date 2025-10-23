import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // Dados mock para demonstração
  const mockStats = {
    total_cases: 42,
    cases_in_intake: 12,
    cases_completed: 18,
    cases_on_hold: 3,
    total_tasks: 87,
    tasks_overdue: 5,
    tasks_pending: 34,
    total_customers: 38,
    total_vehicles: 41,
    total_estimated_revenue: 458750.50,
  };

  const stats = isDemoMode ? mockStats : undefined;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visão geral dos processos de importação
        </p>
      </div>

      {isDemoMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>🎭 Modo DEMO</strong> - Dados fictícios para demonstração. Para funcionalidade completa, configure o Supabase seguindo o <strong>QUICKSTART.md</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardDescription>Total de Processos</CardDescription>
            <CardTitle className="text-3xl">{stats?.total_cases || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardDescription>Em Receção</CardDescription>
            <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
              {stats?.cases_in_intake || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardDescription>Concluídos</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {stats?.cases_completed || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardDescription>Em Espera</CardDescription>
            <CardTitle className="text-3xl text-orange-600 dark:text-orange-400">
              {stats?.cases_on_hold || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas</CardTitle>
            <CardDescription>Gestão de tarefas operacionais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pendentes</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.tasks_pending || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <span className="text-sm text-red-600 dark:text-red-400">Atrasadas</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {stats?.tasks_overdue || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.total_tasks || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base de Dados</CardTitle>
            <CardDescription>Clientes e veículos registados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="text-sm text-gray-600 dark:text-gray-400">Clientes</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.total_customers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="text-sm text-gray-600 dark:text-gray-400">Veículos</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.total_vehicles || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <span className="text-sm text-green-600 dark:text-green-400">Receita Estimada</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  }).format(stats?.total_estimated_revenue || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🚀 Bem-vindo à Plataforma de Importação!
        </h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
          {isDemoMode
            ? "Você está em MODO DEMO. A interface está totalmente funcional com dados fictícios."
            : "Sistema completo para gestão de processos de importação de veículos."}
        </p>
        <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>✅ Interface moderna e responsiva</li>
          <li>✅ Dashboard com métricas em tempo real</li>
          <li>✅ Gestão completa de processos</li>
          <li>✅ Cálculo automático de ISV/IVA/IUC</li>
          <li>✅ Sistema de documentos e tarefas</li>
          <li>✅ Auditoria e relatórios completos</li>
        </ul>
        {isDemoMode && (
          <div className="mt-4 pt-4 border-t border-blue-300 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Para ativar todas as funcionalidades:</strong>
            </p>
            <code className="text-xs text-blue-700 dark:text-blue-300 mt-2 block bg-white/50 dark:bg-black/20 p-2 rounded">
              ./scripts/setup.sh
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
