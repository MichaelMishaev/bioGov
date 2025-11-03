'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronLeft,
  ExternalLink,
  BookOpen,
  HelpCircle,
  FileText
} from 'lucide-react';
import { helpSections, glossary, HelpSection } from '@/lib/helpContent';

export default function HelpPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentSection = helpSections.find(s => s.id === selectedSection);

  // Filter sections by search
  const filteredSections = helpSections.filter(section =>
    section.title.includes(searchQuery) ||
    section.description.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              {selectedSection ? '←' : '💡'} מרכז העזרה
            </h1>
            <p className="text-white/90 text-base sm:text-lg">
              {selectedSection
                ? 'לחצו על החץ כדי לחזור'
                : 'מדריכים מפורטים, זרימות עבודה, והסברים לכל תהליך במערכת'
              }
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {!selectedSection ? (
          <>
            {/* Search */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="חפשו נושא, למשל: מע״מ, ביטוח לאומי, רישיון..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 h-14 text-lg"
                />
              </div>
            </div>

            {/* Help Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {filteredSections.map((section) => (
                <Card
                  key={section.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary"
                  onClick={() => setSelectedSection(section.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{section.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {section.description}
                        </p>
                        <div className="mt-4 text-primary text-sm font-medium flex items-center gap-2">
                          <span>לחצו לקריאה</span>
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Links */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  קישורים מהירים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => window.open('https://www.gov.il', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    Gov.il - שירות לאומי
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => window.open('https://www.mas.gov.il', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    רשות המסים
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => window.open('https://www.btl.gov.il', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    ביטוח לאומי
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Glossary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  מילון מונחים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {glossary.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                      <h4 className="font-bold text-lg text-primary mb-2">
                        {item.term}
                      </h4>
                      <p className="text-gray-700 mb-2 leading-relaxed">
                        {item.definition}
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                        <strong className="text-gray-700">דוגמה:</strong> {item.example}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : currentSection && (
          /* Section Detail View */
          <div>
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setSelectedSection(null)}
              className="mb-6 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 ml-2" />
              חזרה למרכז העזרה
            </Button>

            {/* Section Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{currentSection.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {currentSection.title}
                  </h2>
                  <p className="text-gray-600 text-lg mt-1">
                    {currentSection.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Overview */}
            <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle>סקירה כללית</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {currentSection.content.overview}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>שלבי הביצוע</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {currentSection.content.steps.map((step, index) => (
                    <div key={index} className="relative pr-12">
                      {/* Step Number */}
                      <div className="absolute right-0 top-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>

                      {/* Step Content */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {step.description}
                        </p>

                        {step.tips && step.tips.length > 0 && (
                          <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg">
                            <div className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                              💡 טיפים חשובים:
                            </div>
                            <ul className="space-y-1 text-sm text-yellow-900 mr-4">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Connector Line */}
                      {index < currentSection.content.steps.length - 1 && (
                        <div className="absolute right-[19px] top-12 w-0.5 h-full bg-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Common Questions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-6 h-6" />
                  שאלות נפוצות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {currentSection.content.commonQuestions.map((qa, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-start gap-2">
                        <span className="text-primary flex-shrink-0">❓</span>
                        <span>{qa.question}</span>
                      </h4>
                      <p className="text-gray-700 mr-7 leading-relaxed">
                        {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Links */}
            {currentSection.content.relatedLinks && currentSection.content.relatedLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>קישורים רלוונטיים</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentSection.content.relatedLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-between h-auto py-4"
                        onClick={() => window.open(link.url, link.url.startsWith('http') ? '_blank' : '_self')}
                      >
                        <span className="text-right">{link.title}</span>
                        <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
