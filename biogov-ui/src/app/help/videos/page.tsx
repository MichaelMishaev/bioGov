'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, Clock, Eye, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: string;
  thumbnail: string;
  category: string;
  level: 'מתחילים' | 'מתקדמים' | 'כולם';
  videoUrl?: string; // Placeholder for future video integration
}

const videoTutorials: VideoTutorial[] = [
  {
    id: '1',
    title: 'מדריך התחלה - 5 דקות להצלחה',
    description: 'למדו איך להירשם, למלא פרטים ולהתחיל לעבוד עם המערכת בפחות מ-5 דקות',
    duration: '4:32',
    views: '2.5K',
    thumbnail: '🚀',
    category: 'התחלה',
    level: 'מתחילים'
  },
  {
    id: '2',
    title: 'הבנת ציון התאימות',
    description: 'מה זה ציון התאימות, איך הוא מחושב, ואיך לשפר אותו',
    duration: '3:15',
    views: '1.8K',
    thumbnail: '📊',
    category: 'כללי',
    level: 'כולם'
  },
  {
    id: '3',
    title: 'מע״מ לעוסק המורשה - מדריך מקיף',
    description: 'כל מה שצריך לדעת על דוחות מע"מ, מועדי הגשה, וקיזוז מע"מ תשומות',
    duration: '12:48',
    views: '3.2K',
    thumbnail: '💰',
    category: 'מע״מ',
    level: 'מתקדמים'
  },
  {
    id: '4',
    title: 'איך להגיש דוח מע״מ חודשי',
    description: 'מדריך צעד אחר צעד להגשת דוח מע"מ דרך אתר רשות המסים',
    duration: '8:20',
    views: '4.1K',
    thumbnail: '📝',
    category: 'מע״מ',
    level: 'כולם'
  },
  {
    id: '5',
    title: 'הרשמה כעצמאי בביטוח הלאומי',
    description: 'תהליך ההרשמה, חישוב דמי ביטוח, והקמת הוראת קבע',
    duration: '6:55',
    views: '2.9K',
    thumbnail: '🏥',
    category: 'ביטוח לאומי',
    level: 'מתחילים'
  },
  {
    id: '6',
    title: 'איך להוציא רישיון עסק',
    description: 'המדריך המלא: מבדיקת זכאות ועד קבלת הרישיון',
    duration: '15:30',
    views: '1.5K',
    thumbnail: '📋',
    category: 'רישוי',
    level: 'מתקדמים'
  },
  {
    id: '7',
    title: 'יצירת חשבונית תקינה',
    description: 'מה חייב להיות בחשבונית, איך להנפיק, ואיך לשמור',
    duration: '5:42',
    views: '3.7K',
    thumbnail: '📄',
    category: 'חשבוניות',
    level: 'כולם'
  },
  {
    id: '8',
    title: 'ניהול תזרים מזומנים לעסק קטן',
    description: 'טיפים וכלים לניהול נכון של הכסף בעסק',
    duration: '10:15',
    views: '2.1K',
    thumbnail: '💵',
    category: 'כספים',
    level: 'מתקדמים'
  },
  {
    id: '9',
    title: 'מעבר מעוסק פטור למורשה',
    description: 'מתי עוברים, איך עוברים, ומה צריך לעשות',
    duration: '7:38',
    views: '1.9K',
    thumbnail: '🔄',
    category: 'מע״מ',
    level: 'מתקדמים'
  }
];

const categories = ['הכל', 'התחלה', 'מע״מ', 'ביטוח לאומי', 'רישוי', 'חשבוניות', 'כספים', 'כללי'];

export default function VideosPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [selectedLevel, setSelectedLevel] = useState<string>('הכל');

  const filteredVideos = videoTutorials.filter(video => {
    const categoryMatch = selectedCategory === 'הכל' || video.category === selectedCategory;
    const levelMatch = selectedLevel === 'הכל' || video.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const handleVideoClick = (video: VideoTutorial) => {
    // Placeholder for future video integration
    alert(`וידאו "${video.title}" יהיה זמין בקרוב! \n\nבינתיים, תוכלו למצוא מידע מפורט במרכז העזרה.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 flex items-center gap-3">
              <Play className="w-10 h-10 sm:w-12 sm:h-12" />
              מדריכי וידאו
            </h1>
            <p className="text-white/90 text-base sm:text-lg">
              למדו בקצב שלכם עם מדריכי וידאו ברורים ומפורטים בעברית
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/help')}
          className="mb-6 hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5 ml-2" />
          חזרה למרכז העזרה
        </Button>

        {/* Stats Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-around gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{videoTutorials.length}</div>
                <div className="text-sm text-gray-600">מדריכי וידאו</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">45+</div>
                <div className="text-sm text-gray-600">דקות תוכן</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">20K+</div>
                <div className="text-sm text-gray-600">צפיות</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">סינון לפי נושא:</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">סינון לפי רמה:</h3>
            <div className="flex flex-wrap gap-2">
              {['הכל', 'מתחילים', 'כולם', 'מתקדמים'].map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
              onClick={() => handleVideoClick(video)}
            >
              {/* Thumbnail */}
              <div className="relative bg-gradient-to-br from-primary to-purple-600 aspect-video flex items-center justify-center">
                <div className="text-6xl">{video.thumbnail}</div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary mr-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {video.category}
                  </Badge>
                  <Badge
                    variant={
                      video.level === 'מתחילים' ? 'default' :
                      video.level === 'מתקדמים' ? 'destructive' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {video.level}
                  </Badge>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {video.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {video.duration}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">עוד סרטונים בדרך!</h3>
            <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
              אנחנו עובדים על הוספת עוד מדריכי וידאו מקצועיים. יש נושא ספציפי שתרצו לראות?
            </p>
            <Button variant="outline" size="lg">
              שלחו לנו הצעה
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
