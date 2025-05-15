import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, GitCompareArrows, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    { title: "إدارة الوكلاء", description: "إنشاء وتعديل وحذف الوكلاء.", icon: Users, href: "/agents", color: "text-primary" },
    { title: "محادثة تفاعلية", description: "تحدث مباشرة مع الوكلاء.", icon: MessageSquare, href: "/chat", color: "text-accent" },
    { title: "مقارنة الاستجابات", description: "قارن ردود عدة وكلاء.", icon: GitCompareArrows, href: "/compare", color: "text-purple-400" },
    { title: "خطوط أنابيب الوكلاء", description: "أنشئ تسلسلات من الوكلاء.", icon: Share2, href: "/pipelines", color: "text-orange-400" },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
          مرحباً بك في وكيل بلس
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          منصتك المتكاملة لإدارة الوكلاء الأذكياء والتفاعل معهم وتحليل أدائهم. استكشف الميزات أدناه للبدء.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300 bg-card border-border hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold text-card-foreground">{feature.title}</CardTitle>
              <feature.icon className={`h-8 w-8 ${feature.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground group">
                <Link href={feature.href}>
                  اذهب إلى {feature.title}
                  <ArrowLeft className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-[-4px] rtl:group-hover:translate-x-[4px]" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-16 text-center">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-accent">ابدأ الآن!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              استكشف إمكانيات وكيل بلس وحوّل طريقة تفاعلك مع الذكاء الاصطناعي.
            </p>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/agents">إنشاء أول وكيل</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
