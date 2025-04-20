import { Outlet } from 'react-router-dom'
import Navbar from '../Bar/Navbar'
import Appbar from '../Bar/Appbar'

export default function Layout() {
  return (
    <div className="h-screen flex flex-col">
      <div className="w-full sticky top-0 z-10"><Navbar /></div>
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <div className="w-full sticky bottom-0 z-10 md:hidden"><Appbar /></div>
    </div>
  )
}
