import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

export default function PipelinesPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">خطوط أنابيب الوكلاء</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          أنشئ، كون، ونفذ تسلسلات من الوكلاء لمعالجة المدخلات.
        </p>
      </header>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
            <Share2 className="h-6 w-6 text-accent" />
             ميزة قيد التطوير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">
            نعمل على تطوير واجهة إعداد وتنفيذ خطوط أنابيب الوكلاء. ستتمكن هنا من تعريف تسلسل من الوكلاء لمعالجة رسالة وعرض المخرجات الوسيطة والنهائية.
          </p>
          <div className="mt-6 p-6 bg-background/50 rounded-lg border border-dashed border-border">
            <h3 className="font-semibold text-primary mb-2">ما يمكن توقعه:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>إنشاء خط أنابيب جديد وتسميته.</li>
              <li>إضافة وكلاء إلى خط الأنابيب بترتيب محدد.</li>
              <li>تكوين معلمات خاصة لكل وكيل في السياق.</li>
              <li>تنفيذ خط الأنابيب برسالة إدخال وعرض النتائج.</li>
              <li>حفظ واستدعاء تكوينات خطوط الأنابيب.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
