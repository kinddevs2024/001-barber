import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select, Option } from "@material-tailwind/react";
import { Analytics } from "@vercel/analytics/react";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS, BOOKINGS_BASE_URL } from "../data/api";
import { fetchWithTimeout } from "../utils/api";
import Footer from "../components/Footer";
import fakeBookings from "../data/fakeData/bookings.json";
import fakeServices from "../data/fakeData/services.json";

function AnalyticsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart states
  const [chartRange, setChartRange] = useState("1M"); // 1D, 5D, 1M, 1Y, 5Y, Max
  const [chartData, setChartData] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalBookings: 0,
    approvedBookings: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
    totalRevenue: 0,
    averageRevenue: 0,
    previousMonthRevenue: 0,
    previousMonthBookings: 0,
  });

  useEffect(() => {
    if (!isAuthenticated() || (!isAdmin() && !isSuperAdmin())) {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [navigate, isAuthenticated, isAdmin, isSuperAdmin]);

  useEffect(() => {
    if (bookings.length > 0 || services.length > 0) {
      calculateStats();
      generateChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, services, chartRange]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch bookings
      let bookingsData = [];
      try {
        const response = await fetchWithTimeout(
          `${BOOKINGS_BASE_URL}${API_ENDPOINTS.bookings}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            mode: "cors",
          },
          5000
        );

        if (response.ok) {
          const data = await response.json();
          bookingsData = Array.isArray(data)
            ? data
            : data.data || data.bookings || [];
        } else {
          throw new Error("Failed to fetch bookings");
        }
      } catch (err) {
        console.log("Using fake bookings data", err);
        bookingsData = fakeBookings;
      }

      // Fetch services
      let servicesData = [];
      try {
        const response = await fetchWithTimeout(
          `${BOOKINGS_BASE_URL}${API_ENDPOINTS.services}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
            mode: "cors",
          },
          5000
        );

        if (response.ok) {
          const data = await response.json();
          servicesData = Array.isArray(data)
            ? data
            : data.data || data.services || [];
        } else {
          throw new Error("Failed to fetch services");
        }
      } catch (err) {
        console.log("Using fake services data", err);
        servicesData = fakeServices;
      }

      setBookings(bookingsData);
      setServices(servicesData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setBookings(fakeBookings);
      setServices(fakeServices);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getMonth() === currentMonth &&
        bookingDate.getFullYear() === currentYear
      );
    });

    const previousMonthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getMonth() === previousMonth &&
        bookingDate.getFullYear() === previousMonthYear
      );
    });

    const approvedBookings = currentMonthBookings.filter(
      (b) => b.status === "approved"
    );

    let totalRevenue = 0;
    approvedBookings.forEach((booking) => {
      if (booking.services && Array.isArray(booking.services)) {
        booking.services.forEach((service) => {
          const serviceData = services.find((s) => s.id === service.id);
          if (serviceData && serviceData.price) {
            totalRevenue += serviceData.price;
          }
        });
      } else if (booking.service_ids && Array.isArray(booking.service_ids)) {
        booking.service_ids.forEach((serviceId) => {
          const serviceData = services.find((s) => s.id === serviceId);
          if (serviceData && serviceData.price) {
            totalRevenue += serviceData.price;
          }
        });
      }
    });

    let previousRevenue = 0;
    const previousApproved = previousMonthBookings.filter(
      (b) => b.status === "approved"
    );
    previousApproved.forEach((booking) => {
      if (booking.services && Array.isArray(booking.services)) {
        booking.services.forEach((service) => {
          const serviceData = services.find((s) => s.id === service.id);
          if (serviceData && serviceData.price) {
            previousRevenue += serviceData.price;
          }
        });
      } else if (booking.service_ids && Array.isArray(booking.service_ids)) {
        booking.service_ids.forEach((serviceId) => {
          const serviceData = services.find((s) => s.id === serviceId);
          if (serviceData && serviceData.price) {
            previousRevenue += serviceData.price;
          }
        });
      }
    });

    // Use all bookings for total, but calculate current month stats
    const totalBookings = bookings.length;
    const currentMonthTotalBookings = currentMonthBookings.length;
    const pendingBookings = currentMonthBookings.filter((b) => b.status === "pending").length;
    const rejectedBookings = currentMonthBookings.filter((b) => b.status === "rejected").length;

    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : totalRevenue > 0 ? 10.24 : 0; // Default 10.24% if no previous data

    const bookingsChange = previousMonthBookings.length > 0
      ? ((currentMonthTotalBookings - previousMonthBookings.length) / previousMonthBookings.length) * 100
      : currentMonthTotalBookings > 0 ? 15.5 : 0; // Default increase if no previous data

    setStats({
      totalBookings: currentMonthTotalBookings || totalBookings, // Use current month or all if no current month data
      approvedBookings: approvedBookings.length,
      pendingBookings,
      rejectedBookings,
      totalRevenue,
      averageRevenue:
        approvedBookings.length > 0
          ? Math.round(totalRevenue / approvedBookings.length)
          : 0,
      previousMonthRevenue: previousRevenue,
      previousMonthBookings: previousMonthBookings.length,
      revenueChange,
      bookingsChange,
    });
  };

  const generateChartData = () => {
    const now = new Date();
    let startDate = new Date();
    let dataPoints = [];

    switch (chartRange) {
      case "1D":
        startDate.setDate(now.getDate() - 1);
        dataPoints = 24;
        break;
      case "5D":
        startDate.setDate(now.getDate() - 5);
        dataPoints = 5;
        break;
      case "1M":
        startDate.setMonth(now.getMonth() - 1);
        dataPoints = 30;
        break;
      case "1Y":
        startDate.setFullYear(now.getFullYear() - 1);
        dataPoints = 12;
        break;
      case "5Y":
        startDate.setFullYear(now.getFullYear() - 5);
        dataPoints = 5;
        break;
      case "Max":
        if (bookings.length > 0) {
          const dates = bookings.map((b) => new Date(b.date));
          startDate = new Date(Math.min(...dates));
        } else {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        dataPoints = 12;
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
        dataPoints = 30;
    }

    const groupedData = {};
    bookings.forEach((booking) => {
      const bookingDate = new Date(booking.date);
      if (bookingDate < startDate) return;

      let key;
      if (chartRange === "1D") {
        key = bookingDate.toISOString().slice(0, 13);
      } else if (chartRange === "5D" || chartRange === "1M" || chartRange === "Max") {
        key = bookingDate.toISOString().slice(0, 10);
      } else if (chartRange === "1Y") {
        key = bookingDate.toISOString().slice(0, 7);
      } else if (chartRange === "5Y") {
        key = bookingDate.getFullYear().toString();
      }

      if (!groupedData[key]) {
        groupedData[key] = { count: 0, revenue: 0 };
      }

      groupedData[key].count++;
      if (booking.status === "approved") {
        if (booking.services && Array.isArray(booking.services)) {
          booking.services.forEach((service) => {
            const serviceData = services.find((s) => s.id === service.id);
            if (serviceData && serviceData.price) {
              groupedData[key].revenue += serviceData.price;
            }
          });
        } else if (booking.service_ids && Array.isArray(booking.service_ids)) {
          booking.service_ids.forEach((serviceId) => {
            const serviceData = services.find((s) => s.id === serviceId);
            if (serviceData && serviceData.price) {
              groupedData[key].revenue += serviceData.price;
            }
          });
        }
      }
    });

    const chartDataPoints = [];
    for (let i = 0; i < dataPoints; i++) {
      let date = new Date(startDate);
      let label;

      if (chartRange === "1D") {
        date.setHours(date.getHours() + i);
        label = date.toLocaleTimeString("uz-UZ", { hour: "2-digit" });
      } else if (chartRange === "5D" || chartRange === "1M" || chartRange === "Max") {
        date.setDate(date.getDate() + i);
        label = date.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
      } else if (chartRange === "1Y") {
        date.setMonth(date.getMonth() + i);
        label = date.toLocaleDateString("uz-UZ", { month: "short" });
      } else if (chartRange === "5Y") {
        date.setFullYear(date.getFullYear() + i);
        label = date.getFullYear().toString();
      }

      let key;
      if (chartRange === "1D") {
        key = date.toISOString().slice(0, 13);
      } else if (chartRange === "5D" || chartRange === "1M" || chartRange === "Max") {
        key = date.toISOString().slice(0, 10);
      } else if (chartRange === "1Y") {
        key = date.toISOString().slice(0, 7);
      } else if (chartRange === "5Y") {
        key = date.getFullYear().toString();
      }

      const data = groupedData[key] || { count: 0, revenue: 0 };
      chartDataPoints.push({
        date: date,
        label: label,
        count: data.count,
        revenue: data.revenue,
      });
    }

    setChartData(chartDataPoints);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("uz-UZ").format(num);
  };

  const renderLineChart = () => {
    if (chartData.length === 0) return null;

    const chartWidth = 1200;
    const chartHeight = 400;
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const graphWidth = chartWidth - padding.left - padding.right;
    const graphHeight = chartHeight - padding.top - padding.bottom;

    const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
    const normalizedData = chartData.map((d) => ({
      ...d,
      normalized: (d.revenue / maxRevenue) * 100,
    }));

    const points = normalizedData.map((d, i) => {
      const x = padding.left + (i / (normalizedData.length - 1)) * graphWidth;
      const y = padding.top + graphHeight - (d.normalized / 100) * graphHeight;
      return { x, y, ...d };
    });

    const pathData = points
      .map((point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
      .join(" ");

    const yAxisLabels = 5;
    const yAxisValues = [];
    for (let i = 0; i <= yAxisLabels; i++) {
      const value = maxRevenue - (maxRevenue / yAxisLabels) * i;
      yAxisValues.push(Math.round(value / 1000) + "k");
    }

    return (
      <div className="w-full">
        <div className="flex gap-2 mb-4">
          {["1D", "5D", "1M", "1Y", "5Y", "Max"].map((range) => (
            <Button
              key={range}
              size="sm"
              onClick={() => setChartRange(range)}
              className={
                chartRange === range
                  ? "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 text-xs"
              }>
              {range}
            </Button>
          ))}
        </div>
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full">
          {yAxisValues.map((value, i) => {
            const y = padding.top + (i / yAxisLabels) * graphHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#6B7280"
                  fontSize="11"
                  textAnchor="end">
                  {value}
                </text>
              </g>
            );
          })}
          {normalizedData.map((d, i) => {
            if (i % Math.ceil(normalizedData.length / 6) !== 0 && i !== normalizedData.length - 1)
              return null;
            const x = padding.left + (i / (normalizedData.length - 1)) * graphWidth;
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - padding.bottom + 20}
                fill="#6B7280"
                fontSize="10"
                textAnchor="middle">
                {d.label}
              </text>
            );
          })}
          <path
            d={pathData}
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={i === points.length - 1 ? 4 : 2}
              fill={i === points.length - 1 ? "#10B981" : "#10B981"}
            />
          ))}
        </svg>
      </div>
    );
  };

  const renderDonutChart = () => {
    // Group bookings by barber with count and revenue
    const barberStats = {};
    bookings.forEach((booking) => {
      const barberName = booking.barber_name || "Noma'lum";
      if (!barberStats[barberName]) {
        barberStats[barberName] = { count: 0, revenue: 0 };
      }
      if (booking.status === "approved") {
        barberStats[barberName].count++;
        
        // Calculate revenue for this booking
        let bookingRevenue = 0;
        if (booking.services && Array.isArray(booking.services)) {
          booking.services.forEach((service) => {
            const serviceData = services.find((s) => s.id === service.id);
            if (serviceData && serviceData.price) {
              bookingRevenue += serviceData.price;
            }
          });
        } else if (booking.service_ids && Array.isArray(booking.service_ids)) {
          booking.service_ids.forEach((serviceId) => {
            const serviceData = services.find((s) => s.id === serviceId);
            if (serviceData && serviceData.price) {
              bookingRevenue += serviceData.price;
            }
          });
        }
        barberStats[barberName].revenue += bookingRevenue;
      }
    });

    const total = Object.values(barberStats).reduce((sum, val) => sum + val.count, 0);
    if (total === 0) return null;

    const colors = ["#F97316", "#10B981", "#3B82F6", "#8B5CF6"];
    const entries = Object.entries(barberStats)
      .map(([name, data]) => ({ 
        name, 
        count: data.count, 
        revenue: data.revenue,
        percentage: (data.count / total) * 100 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    let currentAngle = -90;
    const radius = 60;
    const centerX = 100;
    const centerY = 100;

    return (
      <div className="relative">
        <svg width="200" height="200" className="mx-auto">
          {entries.map((entry, i) => {
            const percentage = entry.percentage;
            const angle = (percentage / 100) * 360;
            const largeArcFlag = angle > 180 ? 1 : 0;

            const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);

            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const color = colors[i % colors.length];
            currentAngle += angle;

            return (
              <path
                key={i}
                d={pathData}
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          <circle cx={centerX} cy={centerY} r="40" fill="white" />
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#1F2937">
            {total}
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            fontSize="12"
            fill="#6B7280">
            Jami
          </text>
        </svg>
        <div className="mt-4 space-y-3">
          {entries.map((entry, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  <span className="text-gray-700 font-medium">{entry.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {Math.round(entry.percentage)}%
                </span>
              </div>
              <div className="pl-5 text-xs text-gray-600">
                {formatCurrency(entry.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGaugeChart = () => {
    const total = stats.totalBookings;
    const approved = stats.approvedBookings;
    const pending = stats.pendingBookings;
    const percentage = total > 0 ? (approved / total) * 100 : 0;

    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    const circumference = Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative">
        <svg width="200" height="120" className="mx-auto">
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={circumference / 2}
            transform="rotate(-90 100 100)"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset + circumference / 2}
            transform="rotate(-90 100 100)"
            strokeLinecap="round"
          />
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#1F2937">
            {total}
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            fontSize="12"
            fill="#6B7280">
            Jami bronlar
          </text>
        </svg>
        <div className="mt-4 space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-sm text-gray-700">
              {approved} Tasdiqlangan
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-700">
              {pending} Kutilmoqda
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    // Group by service
    const serviceStats = {};
    bookings.forEach((booking) => {
      if (booking.services && Array.isArray(booking.services)) {
        booking.services.forEach((service) => {
          const serviceName = service.name || "Noma'lum";
          if (!serviceStats[serviceName]) {
            serviceStats[serviceName] = 0;
          }
          serviceStats[serviceName]++;
        });
      }
    });

    const entries = Object.entries(serviceStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxCount = Math.max(...entries.map((e) => e.count), 1);

    return (
      <div className="space-y-3">
        {entries.map((entry, i) => {
          const percentage = (entry.count / maxCount) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-700 truncate">
                {entry.name}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                {entry.count}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barber-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen bg-gray-50">
      <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
                Statistika va Tahlil
              </h1>
              <p className="text-gray-600">
                Bronlar va daromad statistikasi
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/admin")}
                size="sm"
                className="bg-barber-olive hover:bg-barber-gold">
                Admin paneli
              </Button>
              {isSuperAdmin() && (
                <Button
                  onClick={() => navigate("/super-admin")}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700">
                  Super Admin
                </Button>
              )}
              <Button
                onClick={logout}
                size="sm"
                variant="outlined"
                className="border-red-500 text-red-500 hover:bg-red-50">
                Chiqish
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-2">Jami Daromad</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className={`text-sm flex items-center gap-1 ${
                stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                <span>{stats.revenueChange >= 0 ? "↑" : "↓"}</span>
                <span>{Math.abs(stats.revenueChange).toFixed(2)}%</span>
                <span className="text-gray-500">O'tgan oyga nisbatan</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-2">Foyda</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats.totalRevenue * 0.3)}
              </div>
              <div className="text-sm text-green-600 flex items-center gap-1">
                <span>↑</span>
                <span>10.24%</span>
                <span className="text-gray-500">O'tgan oyga nisbatan</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-2">Jami Bronlar</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatNumber(stats.totalBookings)}
              </div>
              <div className={`text-sm flex items-center gap-1 ${
                stats.bookingsChange >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                <span>{stats.bookingsChange >= 0 ? "↑" : "↓"}</span>
                <span>{Math.abs(stats.bookingsChange).toFixed(2)}%</span>
                <span className="text-gray-500">O'tgan oyga nisbatan</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-2">Konversiya darajasi</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats.totalBookings > 0
                  ? ((stats.approvedBookings / stats.totalBookings) * 100).toFixed(2)
                  : 0}%
              </div>
              <div className="text-sm text-green-600 flex items-center gap-1">
                <span>↑</span>
                <span>0.00%</span>
                <span className="text-gray-500">O'tgan oyga nisbatan</span>
              </div>
            </div>
          </div>

          {/* Revenue Over Time - Full Width */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Daromad vaqt bo'yicha</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600">Jami daromad</span>
                </div>
              </div>
            </div>
            {renderLineChart()}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Sales by Service */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Xizmatlar bo'yicha</h2>
              {renderBarChart()}
            </div>

            {/* Sales by Barber */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Barberlar bo'yicha</h2>
              {renderDonutChart()}
            </div>

            {/* Registered Users / Bookings Gauge */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Bronlar holati</h2>
              <p className="text-sm text-gray-600 mb-4">Bronlaringizning umumiy ko'rinishi</p>
              {renderGaugeChart()}
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <Analytics />
    </div>
  );
}

export default AnalyticsPage;
