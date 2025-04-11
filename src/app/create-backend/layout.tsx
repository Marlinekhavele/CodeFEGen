import Navbar from '~/components/navigation/navbar/index'
import GotoTop from '~/components/miscellaneous/goto-top'
import Footer from '~/components/navigation/footer'

export default function BackendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[url('/images/create-backend/bg.jpg')] bg-cover bg-bottom bg-no-repeat lg:mx-auto">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <GotoTop />
    </div>
  )
}
