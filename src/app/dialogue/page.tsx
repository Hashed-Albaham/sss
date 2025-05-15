import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function DialoguePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">حوار آلي بين الوكلاء</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          شاهد محادثات تلقائية بين وكيلين مختلفين.
        </p>
      </header>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-accent" />
            ميزة قيد التطوير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">
            نعمل حاليًا على تطوير واجهة عرض الحوار الآلي بين الوكلاء. ستتمكن قريبًا من إعداد وتشغيل محادثات تلقائية هنا.
          </p>
          <div className="mt-6 p-6 bg-background/50 rounded-lg border border-dashed border-border">
            <h3 className="font-semibold text-primary mb-2">ما يمكن توقعه:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>اختيار وكيلين من قائمة الوكلاء المعرفين.</li>
              <li>بدء الحوار برسالة أولية.</li>
              <li>عرض المحادثة بأسلوب الفقاعات مع تمييز دور كل وكيل.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
