// src/components/property/MortgageCalculator.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Property } from '@/lib/mockData';
import { Percent, Calendar, DollarSign, Calculator } from 'lucide-react';

interface MortgageCalculatorProps {
  selectedProperty?: Property | null;
  onClose?: () => void;
}

export default function MortgageCalculator({ selectedProperty, onClose }: MortgageCalculatorProps) {
  const [price, setPrice] = useState<number>(730000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(10);
  const [years, setYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(3.5);

  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  // Update calculator when property changes
  useEffect(() => {
    if (selectedProperty) {
      setPrice(selectedProperty.pricing.price);
      setDownPaymentPct(selectedProperty.pricing.downPaymentPct || 10);
    }
  }, [selectedProperty]);

  // Recalculate values
  useEffect(() => {
    const downPaymentAmount = price * (downPaymentPct / 100);
    const loanAmount = price - downPaymentAmount;
    
    if (loanAmount <= 0) {
      setMonthlyInstallment(0);
      setTotalInterest(0);
      setTotalPayment(0);
      return;
    }

    const monthlyRate = (interestRate / 100) / 12;
    const totalPayments = years * 12;

    let monthly = 0;
    if (monthlyRate === 0) {
      monthly = loanAmount / totalPayments;
    } else {
      monthly = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    const totalPaid = monthly * totalPayments;
    const interest = totalPaid - loanAmount;

    setMonthlyInstallment(Math.round(monthly));
    setTotalInterest(Math.round(interest));
    setTotalPayment(Math.round(totalPaid + downPaymentAmount));
  }, [price, downPaymentPct, years, interestRate]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(amount) + ' ر.س';
  };

  const downPaymentAmount = price * (downPaymentPct / 100);
  const loanAmount = price - downPaymentAmount;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 md:p-8 text-right shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-[#CAA048]" />
          <h3 className="text-lg font-bold text-brand-black font-cairo">برنامج إتمام للحلول التمويلية | حاسبة الدعم</h3>
        </div>
        {onClose && (
          <button 
            type="button"
            className="text-xs text-gray-500 hover:text-brand-black px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 cursor-pointer transition-colors"
            onClick={onClose}
          >
            إغلاق
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders / Inputs */}
        <div className="space-y-6">
          {/* Property Price Input */}
          <div>
            <label htmlFor="mortgage-price" className="block text-xs font-semibold text-gray-700 mb-2 font-cairo">سعر العقار (ر.س)</label>
            <div className="relative">
              <input
                id="mortgage-price"
                type="number"
                title="سعر العقار بالريال السعودي"
                placeholder="أدخل سعر العقار"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#CAA048] rounded-xl px-4 py-3 text-left font-mono font-bold text-brand-black text-base focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              />
              <DollarSign className="absolute top-1/2 right-4 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 font-mono">الدفعة الأولى: {formatCurrency(downPaymentAmount)}</span>
              <label htmlFor="mortgage-down-payment-pct" className="text-xs font-semibold text-gray-700 font-cairo">نسبة الدفعة الأولى ({downPaymentPct}%)</label>
            </div>
            <div className="relative flex items-center">
              <input
                id="mortgage-down-payment-pct"
                type="range"
                min="10"
                max="90"
                step="5"
                title="نسبة الدفعة الأولى"
                className="w-full accent-[#CAA048] cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Loan Period Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 font-mono">عدد الأشهر: {years * 12} شهر</span>
              <label htmlFor="mortgage-years" className="text-xs font-semibold text-gray-700 font-cairo">مدة التمويل ({years} سنة)</label>
            </div>
            <div className="relative flex items-center">
              <input
                id="mortgage-years"
                type="range"
                min="5"
                max="30"
                step="1"
                title="مدة التمويل بالسنوات"
                className="w-full accent-[#CAA048] cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Interest Rate Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 font-cairo">معدل الفائدة السنوي المتوقع</span>
              <label htmlFor="mortgage-interest-rate" className="text-xs font-semibold text-gray-700 font-cairo">نسبة الفائدة ({interestRate}%)</label>
            </div>
            <div className="relative">
              <input
                id="mortgage-interest-rate"
                type="number"
                step="0.1"
                min="0.1"
                max="15"
                title="نسبة الفائدة السنوية"
                placeholder="مثال: 3.5"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#CAA048] rounded-xl px-4 py-3 text-left font-mono font-bold text-brand-black text-base focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20"
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
              />
              <Percent className="absolute top-1/2 right-4 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col justify-between p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center">
          {/* Main Installment Output */}
          <div className="py-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1 font-cairo">
              القسط الشهري المتوقع
            </h4>
             <p className="text-3xl md:text-4xl font-black text-[#CAA048] font-cairo my-2">
              {new Intl.NumberFormat('en-US').format(monthlyInstallment)} ر.س
            </p>
            <p className="text-[10px] text-gray-400 font-cairo">
              *هذه الحسبة تقديرية وتخضع لموافقة الجهات التمويلية الشريكة
            </p>
          </div>

          {/* Calculations Breakdown */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-right font-cairo">
            <div>
              <p className="text-[10px] text-gray-500 mb-1">قيمة القرض الإجمالية</p>
              <p className="text-sm font-bold text-brand-black">{formatCurrency(loanAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1">الدفعة الأولى المطلوبة</p>
              <p className="text-sm font-bold text-brand-black">{formatCurrency(downPaymentAmount)}</p>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-gray-500 mb-1">إجمالي الفوائد المتراكمة</p>
              <p className="text-sm font-semibold text-amber-600">{formatCurrency(totalInterest)}</p>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-gray-500 mb-1">إجمالي ما سيتم سداده</p>
              <p className="text-sm font-bold text-[#CAA048]">{formatCurrency(totalPayment)}</p>
            </div>
          </div>

          {/* Apply Action Button */}
          <div className="mt-6">
            <a
              href={`https://wa.me/966568526666?text=${encodeURIComponent('مرحباً، أرغب في التقديم على برنامج إتمام للتمويلي بعد حساب القسط الشهري للعقار.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium-gold w-full block py-3 px-4 text-xs font-bold shadow-md rounded-xl transition-all duration-200 cursor-pointer font-cairo text-center"
            >
              قدم طلب التمويل الآن عبر الواتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
