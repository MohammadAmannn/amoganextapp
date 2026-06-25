'use client'

import Navbar from '@/features/storetemplate/components/navbar'
import Footer from '@/features/storetemplate/components/footer'

export default function StoreContactPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-16 px-4 text-center h-[calc(100vh-280px)] flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Have questions? Reach out to us at support@example.com
        </p>
      </div>
      <Footer />
    </>
  )
}
