import { login } from '@/actions/auth'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase">High<span className="text-neutral-500">Hood</span></h1>
          <p className="text-neutral-400 mt-2 font-light">Acceso al Panel de Administración</p>
        </div>

        <form className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-widest" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@highhood.com"
              className="bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-widest" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
            />
          </div>

          <button
            formAction={login}
            className="mt-4 bg-white text-black font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            Entrar al Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}
