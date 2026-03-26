"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  uvIndex: number;
  humidity: number;
  temperature: number;
  weatherCode: number;
  location: string;
}

function getUVLevel(uv: number): { level: string; color: string; advice: string } {
  if (uv <= 2) return { level: "低", color: "text-green-600", advice: "戶外活動無需特別防曬" };
  if (uv <= 5) return { level: "中等", color: "text-yellow-600", advice: "外出建議塗抹 SPF15-30 防曬" };
  if (uv <= 7) return { level: "高", color: "text-orange-500", advice: "外出建議塗抹 SPF30+ 防曬，每 2 小時補塗" };
  if (uv <= 10) return { level: "很高", color: "text-red-500", advice: "盡量避免外出，外出務必塗抹 SPF50+ 防曬" };
  return { level: "極高", color: "text-red-700", advice: "避免外出，外出務必做好全面防曬措施" };
}

function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 49) return "🌫️";
  if (code <= 59) return "🌧️";
  if (code <= 69) return "🌨️";
  if (code <= 79) return "❄️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

export default function WeatherReminder() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user location via IP geolocation (free, no API key needed)
        const geoRes = await fetch("https://ipapi.co/json/");
        if (!geoRes.ok) throw new Error("無法獲取位置");
        const geo = await geoRes.json();

        const lat = geo.latitude;
        const lon = geo.longitude;
        const city = geo.city || geo.country_name || "您的位置";

        // Fetch weather from Open-Meteo
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index,relative_humidity_2m,temperature_2m,weather_code`
        );
        if (!weatherRes.ok) throw new Error("無法獲取天氣");
        const data = await weatherRes.json();

        setWeather({
          uvIndex: data.current.uv_index || 0,
          humidity: data.current.relative_humidity_2m || 0,
          temperature: data.current.temperature_2m || 0,
          weatherCode: data.current.weather_code || 0,
          location: city,
        });
      } catch (err) {
        setError("無法載入天氣資訊");
      } finally {
        setLoading(false);
      }
    };

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem("weather_dismissed");
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const now = new Date();
      if (dismissedDate.toDateString() === now.toDateString()) {
        setDismissed(true);
        setLoading(false);
        return;
      }
    }

    fetchWeather();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("weather_dismissed", new Date().toISOString());
  };

  if (loading || error || dismissed || !weather) return null;

  const uvInfo = getUVLevel(weather.uvIndex);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="rounded-xl bg-gradient-to-r from-skin-50 to-amber-50 border border-skin-100 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{getWeatherEmoji(weather.weatherCode)}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                ☀️ 今日{weather.location}防曬提醒
              </h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="關閉"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">UV 指數：</span>
                <span className={`font-medium ${uvInfo.color}`}>
                  {uvInfo.level}（{weather.uvIndex}）
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">濕度：</span>
                <span className="font-medium text-gray-700">{weather.humidity}%</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">建議：</span>{uvInfo.advice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
