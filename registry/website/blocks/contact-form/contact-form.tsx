"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Section,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // ここを Server Action やフォームサービスに接続してください。
    setSubmitted(true)
  }

  return (
    <Section size="lg" width="xl">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeader className="max-w-md">
          <SectionEyebrow>お問い合わせ</SectionEyebrow>
          <SectionTitle>チームに相談する</SectionTitle>
          <SectionDescription>
            作りたいものを教えてください。通常 1 営業日以内にご返信します。
          </SectionDescription>
        </SectionHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-name">お名前</Label>
              <Input id="contact-name" name="name" required className="h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-email">メールアドレス</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                className="h-10"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-company">会社名</Label>
            <Input id="contact-company" name="company" className="h-10" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-message">ご相談内容</Label>
            <Textarea id="contact-message" name="message" rows={5} required />
          </div>
          <Button type="submit" className="h-10 self-start px-5">
            送信する
          </Button>
          {submitted ? (
            <p role="status" className="text-sm text-muted-foreground">
              送信しました。折り返しご連絡します。
            </p>
          ) : null}
        </form>
      </div>
    </Section>
  )
}
