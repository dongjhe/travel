import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Expense {
  id: string;
  date: string;
  category: string;
  item: string;
  amount: number;
  payment: string;
  note: string;
}

@Component({
  selector: 'app-expense-analysis',
  imports: [FormsModule, RouterLink],
  templateUrl: './expense-analysis.html',
  styleUrl: './expense-analysis.scss',
})
export class ExpenseAnalysis implements AfterViewInit {
  @ViewChild('pieCanvas') pieCanvas?: ElementRef<HTMLCanvasElement>;

  readonly categories = ['餐飲', '超商', '購物', '交通', '住宿', '門票', '藥妝', '其他'];
  readonly payments = ['現金', '刷卡', '交通卡', '電子支付'];
  readonly colors: Record<string, string> = {
    餐飲: '#ff8a00',
    超商: '#2bb3a3',
    購物: '#7c3aed',
    交通: '#2563eb',
    住宿: '#db2777',
    門票: '#16a34a',
    藥妝: '#f43f5e',
    其他: '#64748b',
  };

  expenses: Expense[] = [];
  rate = 0.22;
  form = this.emptyForm();
  private readonly storageKey = 'travel-expenses';

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    this.expenses = saved ? JSON.parse(saved) : [];
  }

  ngAfterViewInit(): void {
    this.drawPie();
  }

  get totalJPY(): number {
    return this.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }

  get totalTWD(): number {
    return this.totalJPY * this.rate;
  }

  get categoryEntries(): [string, number][] {
    const grouped = this.expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + Number(expense.amount);
      return acc;
    }, {});
    return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  }

  addExpense(): void {
    if (!this.form.item.trim() || this.form.amount <= 0) return;
    this.expenses = [
      {
        id: crypto.randomUUID(),
        ...this.form,
        item: this.form.item.trim(),
        note: this.form.note.trim(),
      },
      ...this.expenses,
    ];
    this.form = this.emptyForm();
    this.persistAndDraw();
  }

  addExamples(): void {
    const today = this.today();
    this.expenses = [
      {
        id: crypto.randomUUID(),
        date: today,
        category: '購物',
        item: 'UNIQLO',
        amount: 5000,
        payment: '刷卡',
        note: '衣物',
      },
      {
        id: crypto.randomUUID(),
        date: today,
        category: '超商',
        item: '超商',
        amount: 200,
        payment: '現金',
        note: '飲料/點心',
      },
      ...this.expenses,
    ];
    this.persistAndDraw();
  }

  removeExpense(id: string): void {
    this.expenses = this.expenses.filter((expense) => expense.id !== id);
    this.persistAndDraw();
  }

  clearAll(): void {
    if (!confirm('確定要清空所有消費資料嗎？')) return;
    this.expenses = [];
    this.persistAndDraw();
  }

  onRateChange(): void {
    this.drawPie();
  }

  formatJPY(value: number): string {
    return `¥${Math.round(value).toLocaleString('ja-JP')}`;
  }

  formatTWD(value: number): string {
    return `NT$${Math.round(value).toLocaleString('zh-TW')}`;
  }

  percent(value: number): string {
    return this.totalJPY ? ((value / this.totalJPY) * 100).toFixed(1) : '0.0';
  }

  private emptyForm() {
    return { date: this.today(), category: '餐飲', item: '', amount: 0, payment: '現金', note: '' };
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private persistAndDraw(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.expenses));
    queueMicrotask(() => this.drawPie());
  }

  private drawPie(): void {
    const canvas = this.pieCanvas?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const entries = this.categoryEntries;
    const total = this.totalJPY;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = canvas.width * 0.38;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!total) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#eef2f7';
      ctx.fill();
      ctx.fillStyle = '#667085';
      ctx.font = '700 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('尚無資料', cx, cy + 8);
      return;
    }

    let start = -Math.PI / 2;
    for (const [category, value] of entries) {
      const angle = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = this.colors[category] ?? this.colors['其他'];
      ctx.fill();
      start += angle;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.52, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.fillStyle = '#172033';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.formatJPY(total), cx, cy + 4);
    ctx.fillStyle = '#667085';
    ctx.font = '700 15px sans-serif';
    ctx.fillText('總支出', cx, cy + 30);
  }
}
