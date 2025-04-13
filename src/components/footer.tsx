import Link from "next/link"
import Image from 'next/image'
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-900 py-8 dark:bg-zinc-950">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Image
            src="/codeBE-logo.png"
            alt="CodeBEgen Logo"
            width={30}
            height={30}
            />
          
           <h3 className="text-lg font-medium text-[#7dff00]">CodeBEGen</h3>
          </div>
          <p className="text-sm text-zinc-400">
            Generate backend code using AI. Deploy and test it inside CodeBEGen — without switching tools.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#7dff00]">Resources</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="#" className="hover:text-[#7dff00] transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#7dff00] transition-colors">
                API Reference
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#7dff00] transition-colors">
                Tutorials
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#7dff00] transition-colors">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#7dff00]">Company</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="#" className="hover:text-[#7dff00] transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#7dff00] transition-colors">
                Careers
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#7dff00] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#7dff00] transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#7dff00]">Connect</h3>
          <div className="flex space-x-4">
            <Link href="#" className="text-zinc-400 hover:text-[#7dff00] transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-zinc-400 hover:text-[#7dff00] transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-zinc-400 hover:text-[#7dff00] transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
          <div className="mt-4">
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-500 focus:border-[#7dff00] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-[#7dff00] px-3 py-2 text-sm font-medium text-black hover:bg-[#9aff33]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="container mt-8 border-t border-zinc-800 pt-8">
        <p className="text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} CodeBEGen. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
