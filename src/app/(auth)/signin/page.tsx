'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Metrics Impact Simulator
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your Signifly account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            Sign in with Google
          </Button>
          <p className="mt-4 text-xs text-center text-gray-500">
            Only @signifly.com emails are allowed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
