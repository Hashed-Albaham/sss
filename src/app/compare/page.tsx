import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompareArrows } from "lucide-react";

export default function ComparePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">مقارنة استجابات الوكلاء</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          حلل وقارن ردود عدة وكلاء على نفس الرسالة.
        </p>
      </header>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
            <GitCompareArrows className="h-6 w-6 text-accent" />
             ميزة قيد التطوير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">
            نعمل على تطوير واجهة مقارنة استجابات الوكلاء. ستتمكن هنا من إرسال رسالة إلى عدة وكلاء وعرض ردودهم جنبًا إلى جنب.
          </p>
           <div className="mt-6 p-6 bg-background/50 rounded-lg border border-dashed border-border">
            <h3 className="font-semibold text-primary mb-2">ما يمكن توقعه:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>اختيار مجموعة من الوكلاء للمقارنة.</li>
              <li>إدخال رسالة موحدة لجميع الوكلاء المختارين.</li>
              <li>عرض الاستجابات في أعمدة متجاورة لتسهيل التقييم.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
