import { Hero } from '@/components/landing/hero'
import { Products } from '@/components/landing/products'
import { Engine } from '@/components/landing/engine'
import { Security } from '@/components/landing/security'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Products />
      <Engine />
      <Security />
      <Footer />
    </>
  )
}
