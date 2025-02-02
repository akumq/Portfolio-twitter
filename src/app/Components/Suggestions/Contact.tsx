import React from 'react'
import Link from 'next/link'

function Contact() {
  return (
    <div className="bg-background border border-border_color rounded-xl p-4 m-4">
      <h2 className="text-xl font-bold mb-2">Me contacter</h2>
      <p className="text-sm text-gray-500 mb-4">
        N&apos;hésitez pas à me contacter pour discuter de vos projets ou pour toute autre question.
      </p>
      <Link 
        href="/contact"
        className="inline-block bg-text_highlight text-white font-bold rounded-full px-4 py-2 hover:bg-text_highlight/90 transition-colors"
      >
        Contact
      </Link>
    </div>
  )
}

export default Contact