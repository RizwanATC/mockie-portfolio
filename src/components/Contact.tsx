"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Send, CheckCircle2, AlertCircle, Mail, MapPin } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send");

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-24 px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Contact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Let&apos;s work together
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto">
            Looking for a mobile developer or UI/UX designer for your team?
            Drop me a message and I&apos;ll get back to you.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          {/* Left — contact info */}
          <div className="md:col-span-2 space-y-5">
            <Card className="p-5">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Mail size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-0.5">Email</p>
                    <p className="text-sm text-white">rizwanmatnawi00@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <MapPin size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-0.5">Location</p>
                    <p className="text-sm text-white">Seri Kembangan, Malaysia</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <GitHubLogoIcon className="w-[18px] h-[18px] text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-0.5">GitHub</p>
                    <a
                      href="https://github.com/RizwanATC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white hover:text-indigo-300 transition-colors"
                    >
                      @RizwanATC
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <TwitterLogoIcon className="w-[18px] h-[18px] text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-0.5">Twitter / X</p>
                    <a
                      href="https://x.com/rizwanmatnawi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white hover:text-indigo-300 transition-colors"
                    >
                      @rizwanmatnawi
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/5 text-sm text-green-400">
              <div className="flex items-center gap-2 font-medium mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Open to opportunities
              </div>
              <p className="text-green-400/70 text-xs leading-relaxed">
                Currently available for freelance projects and full-time
                positions as a mobile developer.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-6">
                {status === "success" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 size={48} className="text-green-400 mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">
                      Message sent!
                    </h3>
                    <p className="text-white/50 text-sm mb-6">
                      Thanks for reaching out. I&apos;ll get back to you soon.
                    </p>
                    <Button variant="outline" onClick={() => setStatus("idle")}>
                      Send another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What's this about?"
                        value={form.subject}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell me about your project or opportunity..."
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {status === "error" && (
                      <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertCircle size={16} />
                        Something went wrong. Please try again later.
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
