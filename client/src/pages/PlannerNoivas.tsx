import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, Calendar, DollarSign, Users, CheckCircle, Plus, Trash2, Camera, 
  Save, Download, Upload, RotateCw, X, Check, Award, Eye, Settings, 
  TrendingUp, Clock, MapPin, Grid, AlertCircle
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Definindo os Temas de Casamento Luxuosos
const WEDDING_THEMES = [
  {
    id: "classic_gold",
    label: "Clássico Dourado & Branco ⚜️",
    primary: "#D4AF37",
    accent: "#C5A028",
    bg: "linear-gradient(135deg, #FCFBF7 0%, #FAF8F2 50%, #F5F1E5 100%)",
    cardBg: "#FFF",
    text: "#4A3E1B",
    border: "#EADFB4",
    badgeBg: "#F5ECD7",
    badgeText: "#9B7E1A"
  },
  {
    id: "romantic_rose",
    label: "Romântico Rose Gold & Floral 🌸",
    primary: "#B76E79",
    accent: "#E29578",
    bg: "linear-gradient(135deg, #FFF6F6 0%, #FFF0F1 50%, #FFE3E5 100%)",
    cardBg: "#FFF",
    text: "#5C3E43",
    border: "#F7D6D9",
    badgeBg: "#FCE4E6",
    badgeText: "#A85361"
  },
  {
    id: "cozy_rustic",
    label: "Rústico Cozy & Madeira 🪵",
    primary: "#8B5E3C",
    accent: "#A67B5B",
    bg: "linear-gradient(135deg, #F8F5F2 0%, #F1ECE6 50%, #E2D7C5 100%)",
    cardBg: "#FFF",
    text: "#4E3629",
    border: "#DECBB7",
    badgeBg: "#EFE6DD",
    badgeText: "#6A452C"
  },
  {
    id: "boho_chic",
    label: "Boho Chic & Terracota 🌾",
    primary: "#E76F51",
    accent: "#F4A261",
    bg: "linear-gradient(135deg, #FAF2EE 0%, #F7E7DF 50%, #ECD0C2 100%)",
    cardBg: "#FFF",
    text: "#5E3A31",
    border: "#F3D1C1",
    badgeBg: "#FBE6DC",
    badgeText: "#C44C32"
  }
];

// Tipagem de Dados
interface WeddingTask {
  id: string;
  title: string;
  category: "12-18" | "6-9" | "3" | "1" | "day"; // Fases pré-casamento
  completed: boolean;
}

interface BudgetExpense {
  id: string;
  category: string;
  vendor: string;
  estimated: number;
  actual: number;
  paid: number;
  dueDate: string;
}

interface Guest {
  id: string;
  name: string;
  side: "noiva" | "noivo" | "outro";
  diet: "normal" | "vegano" | "vegetariano" | "sem_gluten";
  rsvp: "confirmado" | "pendente" | "recusado";
  tableId: string | null;
  seatIndex: number | null;
}

interface Table {
  id: string;
  name: string;
  shape: "circle" | "rectangle";
  seatsCount: number;
}

interface MoodboardItem {
  id: string;
  type: "photo" | "sticker";
  content: string; // Emojis ou base64
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface WeddingPlannerData {
  coupleNames: string;
  weddingDate: string;
  weddingLocation: string;
  totalBudgetLimit: number;
  theme: string;
  tasks: WeddingTask[];
  expenses: BudgetExpense[];
  guests: Guest[];
  tables: Table[];
  moodboard: MoodboardItem[];
}

const DEFAULT_WEDDING_DATA: WeddingPlannerData = {
  coupleNames: "Maria & João",
  weddingDate: "2027-06-12",
  weddingLocation: "Espaço Jardins do Amor, São Paulo - SP",
  totalBudgetLimit: 60000,
  theme: "classic_gold",
  tasks: [
    { id: "t1", title: "Definir o orçamento geral do casamento", category: "12-18", completed: true },
    { id: "t2", title: "Escolher a data do casamento e reservar o local", category: "12-18", completed: true },
    { id: "t3", title: "Definir a lista preliminar de convidados", category: "12-18", completed: false },
    { id: "t4", title: "Contratar o buffet e serviço de gastronomia", category: "6-9", completed: false },
    { id: "t5", title: "Escolher o vestido de noiva e traje do noivo", category: "6-9", completed: false },
    { id: "t6", title: "Enviar os convites e configurar o site de casamento", category: "3", completed: false },
    { id: "t7", title: "Fazer o teste de cabelo e maquiagem", category: "1", completed: false },
    { id: "t8", title: "Definir o mapa de assentos finais", category: "1", completed: false },
    { id: "t9", title: "Aproveitar e celebrar o dia mais feliz da sua vida! 💖", category: "day", completed: false }
  ],
  expenses: [
    { id: "e1", category: "Espaço & Buffet", vendor: "Espaço Jardins", estimated: 25000, actual: 24000, paid: 12000, dueDate: "2026-12-15" },
    { id: "e2", category: "Decoração Floral", vendor: "Flores do Campo", estimated: 8000, actual: 7500, paid: 3000, dueDate: "2027-02-10" },
    { id: "e3", category: "Fotografia & Filme", vendor: "Lente de Amor", estimated: 6000, actual: 6000, paid: 6000, dueDate: "2026-10-01" },
    { id: "e4", category: "Vestido & Acessórios", vendor: "Ateliê Bouquet", estimated: 5000, actual: 4800, paid: 4800, dueDate: "2026-11-20" }
  ],
  guests: [
    { id: "g1", name: "Ana Maria (Mãe da Noiva)", side: "noiva", diet: "normal", rsvp: "confirmado", tableId: null, seatIndex: null },
    { id: "g2", name: "Roberto Silva (Pai da Noiva)", side: "noiva", diet: "normal", rsvp: "confirmado", tableId: null, seatIndex: null },
    { id: "g3", name: "Juliana Costa (Madrinha)", side: "noiva", diet: "vegano", rsvp: "confirmado", tableId: null, seatIndex: null },
    { id: "g4", name: "Pedro Antunes (Padrinho)", side: "noiva", diet: "normal", rsvp: "confirmado", tableId: null, seatIndex: null },
    { id: "g5", name: "Tereza Ramos (Mãe do Noivo)", side: "noivo", diet: "normal", rsvp: "confirmado", tableId: null, seatIndex: null },
    { id: "g6", name: "Carlos Ramos (Pai do Noivo)", side: "noivo", diet: "normal", rsvp: "confirmado", tableId: null, seatIndex: null },
    { id: "g7", name: "Lucas Ramos (Irmão do Noivo)", side: "noivo", diet: "normal", rsvp: "confirmado", tableId: null, seatIndex: null },
    { id: "g8", name: "Fernanda Lima (Madrinha)", side: "noivo", diet: "sem_gluten", rsvp: "confirmado", tableId: null, seatIndex: null },
    { id: "g9", name: "Tio Jorge", side: "noivo", diet: "normal", rsvp: "pendente", tableId: null, seatIndex: null },
    { id: "g10", name: "Tia Marta", side: "noivo", diet: "normal", rsvp: "pendente", tableId: null, seatIndex: null }
  ],
  tables: [
    { id: "tab1", name: "Mesa Família Noiva", shape: "circle", seatsCount: 6 },
    { id: "tab2", name: "Mesa Família Noivo", shape: "circle", seatsCount: 6 },
    { id: "tab3", name: "Mesa Madrinhas & Padrinhos", shape: "rectangle", seatsCount: 8 }
  ],
  moodboard: []
};

// Adesivos do Moodboard
const WEDDING_STICKERS = [
  { id: "rings", label: "Alianças 💍" },
  { id: "cheers", label: "Champagne 🥂" },
  { id: "cake", label: "Bolo 🎂" },
  { id: "hearts", label: "Corações 💕" },
  { id: "flowers", label: "Flores 💐" },
  { id: "dress", label: "Vestido 👗" },
  { id: "bell", label: "Sinos 🔔" },
  { id: "camera", label: "Fotos 📸" }
];

export default function PlannerNoivas() {
  const [plannerData, setPlannerData] = useLocalStorage<WeddingPlannerData>(
    "planner_noivas_premium_data",
    DEFAULT_WEDDING_DATA
  );

  const currentTheme = WEDDING_THEMES.find(t => t.id === plannerData.theme) || WEDDING_THEMES[0];

  // Abas do APP
  const [activeTab, setActiveTab] = useState<"dashboard" | "checklist" | "budget" | "guests" | "tables" | "moodboard">("dashboard");

  // Contagem regressiva
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const difference = +new Date(plannerData.weddingDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [plannerData.weddingDate]);

  // Auxiliares de Modificação de Campos do State Principal
  const updateField = <K extends keyof WeddingPlannerData>(field: K, val: WeddingPlannerData[K]) => {
    setPlannerData(prev => ({ ...prev, [field]: val }));
  };

  // ==================== 1. CHECKLIST LOGIC ====================
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [checklistFilter, setNewChecklistFilter] = useState<"12-18" | "6-9" | "3" | "1" | "day">("12-18");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    const newTask: WeddingTask = {
      id: `task-${Date.now()}`,
      title: newChecklistTitle.trim(),
      category: checklistFilter,
      completed: false
    };
    updateField("tasks", [...plannerData.tasks, newTask]);
    setNewChecklistTitle("");
  };

  const toggleTask = (taskId: string) => {
    const updated = plannerData.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    updateField("tasks", updated);
  };

  const deleteTask = (taskId: string) => {
    const updated = plannerData.tasks.filter(t => t.id !== taskId);
    updateField("tasks", updated);
  };

  // ==================== 2. BUDGET LOGIC ====================
  const [newExpCategory, setNewExpCategory] = useState("");
  const [newExpVendor, setNewExpVendor] = useState("");
  const [newExpEstimated, setNewExpEstimated] = useState("");
  const [newExpActual, setNewExpActual] = useState("");
  const [newExpPaid, setNewExpPaid] = useState("");
  const [newExpDueDate, setNewExpDueDate] = useState("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpCategory.trim() || !newExpVendor.trim()) return;

    const newExp: BudgetExpense = {
      id: `exp-${Date.now()}`,
      category: newExpCategory.trim(),
      vendor: newExpVendor.trim(),
      estimated: parseFloat(newExpEstimated) || 0,
      actual: parseFloat(newExpActual) || 0,
      paid: parseFloat(newExpPaid) || 0,
      dueDate: newExpDueDate || new Date().toISOString().split("T")[0]
    };

    updateField("expenses", [...plannerData.expenses, newExp]);
    setNewExpCategory("");
    setNewExpVendor("");
    setNewExpEstimated("");
    setNewExpActual("");
    setNewExpPaid("");
    setNewExpDueDate("");
  };

  const deleteExpense = (id: string) => {
    updateField("expenses", plannerData.expenses.filter(e => e.id !== id));
  };

  // Cálculos do orçamento
  const totalEstimated = plannerData.expenses.reduce((sum, e) => sum + e.estimated, 0);
  const totalActual = plannerData.expenses.reduce((sum, e) => sum + e.actual, 0);
  const totalPaid = plannerData.expenses.reduce((sum, e) => sum + e.paid, 0);
  const totalRemaining = Math.max(0, totalActual - totalPaid);

  // ==================== 3. GUESTS LOGIC ====================
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestSide, setNewGuestSide] = useState<"noiva" | "noivo" | "outro">("noiva");
  const [newGuestDiet, setNewGuestDiet] = useState<"normal" | "vegano" | "vegetariano" | "sem_gluten">("normal");
  const [newGuestRsvp, setNewGuestRsvp] = useState<"confirmado" | "pendente" | "recusado">("confirmado");
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilterRsvp, setGuestFilterRsvp] = useState<"todos" | "confirmado" | "pendente" | "recusado">("todos");

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newGuest: Guest = {
      id: `guest-${Date.now()}`,
      name: newGuestName.trim(),
      side: newGuestSide,
      diet: newGuestDiet,
      rsvp: newGuestRsvp,
      tableId: null,
      seatIndex: null
    };

    updateField("guests", [...plannerData.guests, newGuest]);
    setNewGuestName("");
  };

  const deleteGuest = (id: string) => {
    updateField("guests", plannerData.guests.filter(g => g.id !== id));
  };

  const updateGuestField = <K extends keyof Guest>(id: string, field: K, value: Guest[K]) => {
    const updated = plannerData.guests.map(g => g.id === id ? { ...g, [field]: value } : g);
    updateField("guests", updated);
  };

  const filteredGuests = plannerData.guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(guestSearch.toLowerCase());
    const matchesFilter = guestFilterRsvp === "todos" || g.rsvp === guestFilterRsvp;
    return matchesSearch && matchesFilter;
  });

  // ==================== 4. SEATING MAP LOGIC ====================
  const [newTableName, setNewTableName] = useState("");
  const [newTableShape, setNewTableShape] = useState<"circle" | "rectangle">("circle");
  const [newTableSeats, setNewTableSeats] = useState(6);
  const [selectedTableForZoom, setSelectedTableForZoom] = useState<string | null>(null);

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const newTable: Table = {
      id: `table-${Date.now()}`,
      name: newTableName.trim(),
      shape: newTableShape,
      seatsCount: newTableSeats
    };

    updateField("tables", [...plannerData.tables, newTable]);
    setNewTableName("");
  };

  const deleteTable = (id: string) => {
    // Liberar todos os convidados sentados nessa mesa
    const freedGuests = plannerData.guests.map(g => 
      g.tableId === id ? { ...g, tableId: null, seatIndex: null } : g
    );
    setPlannerData(prev => ({
      ...prev,
      guests: freedGuests,
      tables: prev.tables.filter(t => t.id !== id)
    }));
    if (selectedTableForZoom === id) {
      setSelectedTableForZoom(null);
    }
  };

  // Funções de Drag & Drop para assentamento
  const handleSeatGuest = (guestId: string, tableId: string, seatIndex: number) => {
    // Verificar se já tem alguém nesse assento e liberá-lo
    const updatedGuests = plannerData.guests.map(g => {
      if (g.tableId === tableId && g.seatIndex === seatIndex) {
        return { ...g, tableId: null, seatIndex: null };
      }
      if (g.id === guestId) {
        return { ...g, tableId, seatIndex };
      }
      return g;
    });
    updateField("guests", updatedGuests);
  };

  const handleUnseatGuest = (guestId: string) => {
    const updatedGuests = plannerData.guests.map(g => 
      g.id === guestId ? { ...g, tableId: null, seatIndex: null } : g
    );
    updateField("guests", updatedGuests);
  };

  // ==================== 5. MOODBOARD LOGIC ====================
  const moodboardRef = useRef<HTMLDivElement>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [draggedMoodItem, setDraggedMoodItem] = useState<{ id: string; startX: number; startY: number } | null>(null);

  const addMoodSticker = (stickerId: string) => {
    const newItem: MoodboardItem = {
      id: `mood-${Date.now()}`,
      type: "sticker",
      content: stickerId,
      x: 10 + Math.random() * 40,
      y: 10 + Math.random() * 40,
      scale: 1,
      rotation: 0
    };
    updateField("moodboard", [...plannerData.moodboard, newItem]);
  };

  const handleMoodPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newItem: MoodboardItem = {
        id: `mood-${Date.now()}`,
        type: "photo",
        content: reader.result as string,
        x: 10 + Math.random() * 40,
        y: 10 + Math.random() * 40,
        scale: 1.5,
        rotation: 0
      };
      updateField("moodboard", [...plannerData.moodboard, newItem]);
    };
    reader.readAsDataURL(file);
  };

  const deleteMoodItem = (id: string) => {
    updateField("moodboard", plannerData.moodboard.filter(m => m.id !== id));
    if (selectedMoodId === id) setSelectedMoodId(null);
  };

  const updateMoodItem = (id: string, updates: Partial<MoodboardItem>) => {
    const updated = plannerData.moodboard.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    updateField("moodboard", updated);
  };

  const handleMoodMouseDown = (itemId: string, e: React.MouseEvent) => {
    setSelectedMoodId(itemId);
    setDraggedMoodItem({
      id: itemId,
      startX: e.clientX,
      startY: e.clientY
    });
  };

  const handleMoodMouseMove = (e: React.MouseEvent) => {
    if (!draggedMoodItem || !moodboardRef.current) return;
    const rect = moodboardRef.current.getBoundingClientRect();
    const item = plannerData.moodboard.find(m => m.id === draggedMoodItem.id);
    if (!item) return;

    // Calcular novas posições em porcentagem
    const deltaX = ((e.clientX - draggedMoodItem.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - draggedMoodItem.startY) / rect.height) * 100;

    const newX = Math.max(0, Math.min(90, item.x + deltaX));
    const newY = Math.max(0, Math.min(90, item.y + deltaY));

    updateMoodItem(draggedMoodItem.id, { x: newX, y: newY });
    setDraggedMoodItem({
      id: draggedMoodItem.id,
      startX: e.clientX,
      startY: e.clientY
    });
  };

  const handleMoodMouseUp = () => {
    setDraggedMoodItem(null);
  };

  // ==================== 6. IMPORT/EXPORT DATA ====================
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plannerData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `planner-noivas-${plannerData.coupleNames.toLowerCase().replace(/\s+/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (typeof imported.coupleNames === "string" && Array.isArray(imported.tasks)) {
          setPlannerData({
            ...DEFAULT_WEDDING_DATA,
            ...imported
          });
          alert("Planner de Casamento Carregado com Sucesso! 🌸");
        } else {
          alert("Arquivo inválido ou corrompido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm("Deseja mesmo redefinir TODO o seu Planner de Casamento? Isso apagará orçamentos, lista de convidados, assentos e fotos.")) {
      setPlannerData(DEFAULT_WEDDING_DATA);
      setSelectedTableForZoom(null);
      setSelectedMoodId(null);
      alert("Planner de Casamento redefinido com sucesso! Comece a planejar o seu sonho 🌸");
    }
  };

  return (
    <div
      className={`planner-page ${activeTab === "tables" ? "modal-open-print" : ""}`}
      style={{
        minHeight: "100vh",
        background: currentTheme.bg,
        fontFamily: "'Nunito', sans-serif",
        color: currentTheme.text,
        paddingBottom: "3rem",
        transition: "background 0.5s, color 0.5s"
      }}
    >
      {/* HEADER DE CONTROLE DO APP */}
      <header
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: `1.5px solid ${currentTheme.border}`,
          background: "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.8rem" }}>👰</span>
          <div>
            <h1 style={{ fontWeight: 900, color: currentTheme.text, fontSize: "1.1rem", margin: 0 }}>
              Planner de Noivas Premium
            </h1>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: currentTheme.accent, textTransform: "uppercase" }}>
              Wedding Organizer & Seating Planner
            </span>
          </div>
        </div>

        {/* Botões de Ações Globais */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <label
            style={{
              background: "#FFF",
              border: `1.5px solid ${currentTheme.border}`,
              color: currentTheme.text,
              borderRadius: "0.75rem",
              padding: "0.4rem 0.8rem",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <Upload size={12} /> Importar .JSON
            <input type="file" accept=".json" onChange={handleImportData} style={{ display: "none" }} />
          </label>
          <button
            onClick={handleExportData}
            style={{
              background: currentTheme.primary,
              color: "#FFF",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <Download size={12} /> Exportar Projeto
          </button>
          <button
            onClick={handleResetData}
            style={{
              background: "#FFF",
              border: "1.5px solid #F7D6D9",
              color: "#A85361",
              borderRadius: "0.75rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <Trash2 size={12} /> Limpar
          </button>
        </div>
      </header>

      {/* CONTAINER PRINCIPAL */}
      <div className="main-print-container" style={{ maxWidth: 1050, margin: "1.5rem auto", padding: "0 1.5rem" }}>
        
        {/* ABAS DO APP */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1.2rem",
            alignItems: "center"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              background: "rgba(0,0,0,0.03)",
              padding: "0.25rem",
              borderRadius: "0.8rem"
            }}
          >
            {[
              { id: "dashboard", label: "⚜️ Dashboard" },
              { id: "checklist", label: "📋 Checklist" },
              { id: "budget", label: "💰 Orçamento" },
              { id: "guests", label: "👥 Convidados" },
              { id: "tables", label: "🍽️ Mesa de Assentos" },
              { id: "moodboard", label: "🌸 Inspirações" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedTableForZoom(null);
                  setSelectedMoodId(null);
                }}
                style={{
                  background: activeTab === tab.id ? currentTheme.cardBg : "transparent",
                  border: "none",
                  fontWeight: 800,
                  color: activeTab === tab.id ? currentTheme.primary : currentTheme.text,
                  fontSize: "0.78rem",
                  padding: "0.5rem 0.85rem",
                  borderRadius: "0.6rem",
                  cursor: "pointer",
                  boxShadow: activeTab === tab.id ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Seletor Rápido de Temas */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.text }}>Estilo do Planner:</span>
            <select
              value={plannerData.theme}
              onChange={e => updateField("theme", e.target.value)}
              style={{
                background: "#FFF",
                border: `1.5px solid ${currentTheme.border}`,
                borderRadius: "0.5rem",
                padding: "0.25rem 0.5rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: currentTheme.text,
                cursor: "pointer",
                outline: "none"
              }}
            >
              {WEDDING_THEMES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Bloco de Contagem Regressiva e Local */}
            <div
              style={{
                background: currentTheme.cardBg,
                border: `1.5px solid ${currentTheme.border}`,
                borderRadius: "1.5rem",
                padding: "2rem",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}
            >
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: currentTheme.accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Contagem Regressiva para o Grande Dia
              </span>
              
              <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", width: "100%" }}>
                <input
                  value={plannerData.coupleNames}
                  onChange={e => updateField("coupleNames", e.target.value)}
                  placeholder="Nome da Noiva & Nome do Noivo"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "2rem",
                    fontWeight: 900,
                    textAlign: "right",
                    color: currentTheme.primary,
                    width: "45%",
                    outline: "none",
                    fontFamily: "'Playfair Display', serif"
                  }}
                />
                <span style={{ fontSize: "2rem", fontWeight: 900, color: currentTheme.primary, fontFamily: "'Playfair Display', serif" }}>&</span>
                <input
                  value={plannerData.coupleNames.split("&")[1] || ""}
                  onChange={e => {
                    const firstPart = plannerData.coupleNames.split("&")[0] || "Noiva";
                    updateField("coupleNames", `${firstPart.trim()} & ${e.target.value.trim()}`);
                  }}
                  placeholder="Parceiro(a)"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "2rem",
                    fontWeight: 900,
                    textAlign: "left",
                    color: currentTheme.primary,
                    width: "45%",
                    outline: "none",
                    fontFamily: "'Playfair Display', serif"
                  }}
                />
              </div>

              {/* Timer de contagem */}
              <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", margin: "1.5rem 0" }}>
                {[
                  { value: timeLeft.days, label: "Dias" },
                  { value: timeLeft.hours, label: "Horas" },
                  { value: timeLeft.minutes, label: "Minutos" },
                  { value: timeLeft.seconds, label: "Segundos" }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        background: currentTheme.badgeBg,
                        color: currentTheme.badgeText,
                        fontSize: "2rem",
                        fontWeight: 900,
                        padding: "0.6rem 1.2rem",
                        borderRadius: "1rem",
                        minWidth: "75px"
                      }}
                    >
                      {item.value.toString().padStart(2, "0")}
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, marginTop: "0.4rem", textTransform: "uppercase", color: "#8C8C8C" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Info de Data e Local */}
              <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={16} style={{ color: currentTheme.accent }} />
                  <input
                    type="date"
                    value={plannerData.weddingDate}
                    onChange={e => updateField("weddingDate", e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: currentTheme.text,
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "350px" }}>
                  <MapPin size={16} style={{ color: currentTheme.accent }} />
                  <input
                    value={plannerData.weddingLocation}
                    onChange={e => updateField("weddingLocation", e.target.value)}
                    placeholder="Local do casamento..."
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: currentTheme.text,
                      width: "100%",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Três Cards de Resumo Rápido */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem" }}>
              
              {/* Card 1: Orçamento Geral */}
              <div
                style={{
                  background: currentTheme.cardBg,
                  border: `1.5px solid ${currentTheme.border}`,
                  borderRadius: "1.2rem",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                  boxShadow: "0 3px 15px rgba(0,0,0,0.02)"
                }}
              >
                <div
                  style={{
                    background: currentTheme.badgeBg,
                    color: currentTheme.badgeText,
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <DollarSign size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#8C8C8C", display: "block" }}>
                    ORÇAMENTO REAL / ESTIMADO
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                    <span style={{ fontSize: "1.3rem", fontWeight: 900, color: currentTheme.text }}>
                      R$ {totalActual.toLocaleString("pt-BR")}
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8C8C8C" }}>
                      / R$ {totalEstimated.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {/* Barra de Progresso do Orçamento */}
                  <div style={{ background: "#F0F0F0", height: "6px", borderRadius: "3px", marginTop: "0.5rem", position: "relative", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        background: totalActual > plannerData.totalBudgetLimit ? "#E63946" : currentTheme.accent, 
                        width: `${Math.min(100, (totalActual / (plannerData.totalBudgetLimit || 1)) * 100)}%`, 
                        height: "100%", 
                        borderRadius: "3px" 
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#8C8C8C", marginTop: "0.2rem", display: "block" }}>
                    Limite estipulado: R$ {plannerData.totalBudgetLimit.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              {/* Card 2: Lista de Convidados & RSVP */}
              <div
                style={{
                  background: currentTheme.cardBg,
                  border: `1.5px solid ${currentTheme.border}`,
                  borderRadius: "1.2rem",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                  boxShadow: "0 3px 15px rgba(0,0,0,0.02)"
                }}
              >
                <div
                  style={{
                    background: currentTheme.badgeBg,
                    color: currentTheme.badgeText,
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Users size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#8C8C8C", display: "block" }}>
                    RSVPS / TOTAL CONVIDADOS
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                    <span style={{ fontSize: "1.3rem", fontWeight: 900, color: currentTheme.text }}>
                      {plannerData.guests.filter(g => g.rsvp === "confirmado").length} CONFIRMADOS
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8C8C8C" }}>
                      / {plannerData.guests.length} total
                    </span>
                  </div>
                  <div style={{ background: "#F0F0F0", height: "6px", borderRadius: "3px", marginTop: "0.5rem", position: "relative", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        background: currentTheme.accent, 
                        width: `${(plannerData.guests.filter(g => g.rsvp === "confirmado").length / (plannerData.guests.length || 1)) * 100}%`, 
                        height: "100%", 
                        borderRadius: "3px" 
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#8C8C8C", marginTop: "0.2rem", display: "block" }}>
                    Pendentes: {plannerData.guests.filter(g => g.rsvp === "pendente").length} convidados
                  </span>
                </div>
              </div>

              {/* Card 3: Checklist Geral */}
              <div
                style={{
                  background: currentTheme.cardBg,
                  border: `1.5px solid ${currentTheme.border}`,
                  borderRadius: "1.2rem",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                  boxShadow: "0 3px 15px rgba(0,0,0,0.02)"
                }}
              >
                <div
                  style={{
                    background: currentTheme.badgeBg,
                    color: currentTheme.badgeText,
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <CheckCircle size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#8C8C8C", display: "block" }}>
                    TAREFAS CONCLUÍDAS
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                    <span style={{ fontSize: "1.3rem", fontWeight: 900, color: currentTheme.text }}>
                      {plannerData.tasks.filter(t => t.completed).length} CONCLUÍDAS
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8C8C8C" }}>
                      / {plannerData.tasks.length} tarefas
                    </span>
                  </div>
                  <div style={{ background: "#F0F0F0", height: "6px", borderRadius: "3px", marginTop: "0.5rem", position: "relative", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        background: currentTheme.accent, 
                        width: `${(plannerData.tasks.filter(t => t.completed).length / (plannerData.tasks.length || 1)) * 100}%`, 
                        height: "100%", 
                        borderRadius: "3px" 
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#8C8C8C", marginTop: "0.2rem", display: "block" }}>
                    Restante: {plannerData.tasks.filter(t => !t.completed).length} tarefas pendentes
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 2: CHECKLIST ==================== */}
        {activeTab === "checklist" && (
          <div
            style={{
              background: currentTheme.cardBg,
              border: `1.5px solid ${currentTheme.border}`,
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "2rem"
            }}
          >
            {/* Seletor de Fases */}
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.accent, textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Fases de Organização
              </span>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: currentTheme.text, margin: "0 0 1rem" }}>
                Cronograma do Sonho ⏳
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { id: "12-18", label: "12 a 18 meses antes" },
                  { id: "6-9", label: "6 a 9 meses antes" },
                  { id: "3", label: "3 meses antes" },
                  { id: "1", label: "1 mês antes" },
                  { id: "day", label: "No dia do casamento!" }
                ].map(phase => (
                  <button
                    key={phase.id}
                    onClick={() => setNewChecklistFilter(phase.id as any)}
                    style={{
                      background: checklistFilter === phase.id ? currentTheme.badgeBg : "#FFF",
                      border: `1.5px solid ${checklistFilter === phase.id ? currentTheme.primary : currentTheme.border}`,
                      color: checklistFilter === phase.id ? currentTheme.primary : currentTheme.text,
                      borderRadius: "0.85rem",
                      padding: "0.6rem 1rem",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span>{phase.label}</span>
                    <span style={{ background: "#FFF", borderRadius: "50%", padding: "0.1rem 0.35rem", fontSize: "0.65rem", border: `1px solid ${currentTheme.border}` }}>
                      {plannerData.tasks.filter(t => t.category === phase.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Listagem das tarefas */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 900, color: currentTheme.text }}>
                  Tarefas: {plannerData.tasks.filter(t => t.category === checklistFilter).length}
                </h3>
              </div>

              {/* Form para Adicionar Tarefa */}
              <form onSubmit={handleAddTask} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <input
                  value={newChecklistTitle}
                  onChange={e => setNewChecklistTitle(e.target.value)}
                  placeholder="Adicionar nova tarefa para esta fase..."
                  style={{
                    flex: 1,
                    background: "#FFF",
                    border: `1.5px solid ${currentTheme.border}`,
                    borderRadius: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.8rem",
                    color: currentTheme.text,
                    outline: "none"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: currentTheme.primary,
                    color: "#FFF",
                    border: "none",
                    borderRadius: "0.75rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  Adicionar
                </button>
              </form>

              {/* Lista */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                {plannerData.tasks.filter(t => t.category === checklistFilter).length === 0 ? (
                  <div style={{ textAlign: "center", color: "#8C8C8C", padding: "2rem", fontSize: "0.8rem" }}>
                    Nenhuma tarefa cadastrada nesta fase. Adicione uma acima! ✨
                  </div>
                ) : (
                  plannerData.tasks.filter(t => t.category === checklistFilter).map(task => (
                    <div
                      key={task.id}
                      style={{
                        background: task.completed ? "rgba(0,0,0,0.02)" : "#FFF",
                        border: `1.5px solid ${task.completed ? currentTheme.border : currentTheme.border}`,
                        borderRadius: "1rem",
                        padding: "0.65rem 1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          color: task.completed ? "#8C8C8C" : currentTheme.text,
                          textDecoration: task.completed ? "line-through" : "none"
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `1.5px solid ${task.completed ? currentTheme.accent : "#8C8C8C"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: task.completed ? currentTheme.accent : "#FFF"
                          }}
                        >
                          {task.completed && <Check size={11} style={{ color: "#FFF" }} />}
                        </div>
                        <span>{task.title}</span>
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#A85361"
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: BUDGET ==================== */}
        {activeTab === "budget" && (
          <div
            style={{
              background: currentTheme.cardBg,
              border: `1.5px solid ${currentTheme.border}`,
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem"
            }}
          >
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.accent, textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Gestão Financeira do Casamento
              </span>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: currentTheme.text, margin: 0 }}>
                Gastos & Pagamentos 💰
              </h2>
            </div>

            {/* Barra de Totais em Destaque */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", background: "#FAF8F2", padding: "1.2rem", borderRadius: "1.2rem", border: `1px solid ${currentTheme.border}` }}>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#8C8C8C" }}>TOTAL ESTIMADO</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: currentTheme.text }}>R$ {totalEstimated.toLocaleString("pt-BR")}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#8C8C8C" }}>VALOR CONTRATADO</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: currentTheme.text }}>R$ {totalActual.toLocaleString("pt-BR")}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#8C8C8C" }}>VALOR PAGO</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#9B7E1A" }}>R$ {totalPaid.toLocaleString("pt-BR")}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#8C8C8C" }}>RESTANTE A PAGAR</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#A85361" }}>R$ {totalRemaining.toLocaleString("pt-BR")}</div>
              </div>
            </div>

            {/* Form para Adicionar Despesa */}
            <form onSubmit={handleAddExpense} style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", background: "#FFFBF2", padding: "1rem", borderRadius: "1rem", border: `1.5px dashed ${currentTheme.border}` }}>
              <input
                value={newExpCategory}
                onChange={e => setNewExpCategory(e.target.value)}
                placeholder="Categoria (Ex: Decoração)"
                style={{ flex: "1 1 180px", background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              />
              <input
                value={newExpVendor}
                onChange={e => setNewExpVendor(e.target.value)}
                placeholder="Fornecedor"
                style={{ flex: "1 1 180px", background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              />
              <input
                type="number"
                value={newExpEstimated}
                onChange={e => setNewExpEstimated(e.target.value)}
                placeholder="Est. R$"
                style={{ width: "85px", background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              />
              <input
                type="number"
                value={newExpActual}
                onChange={e => setNewExpActual(e.target.value)}
                placeholder="Real R$"
                style={{ width: "85px", background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              />
              <input
                type="number"
                value={newExpPaid}
                onChange={e => setNewExpPaid(e.target.value)}
                placeholder="Pago R$"
                style={{ width: "85px", background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              />
              <input
                type="date"
                value={newExpDueDate}
                onChange={e => setNewExpDueDate(e.target.value)}
                style={{ width: "120px", background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              />
              <button
                type="submit"
                style={{ background: currentTheme.primary, color: "#FFF", border: "none", borderRadius: "0.5rem", padding: "0.4rem 0.9rem", fontSize: "0.78rem", fontWeight: 800, cursor: "pointer" }}
              >
                + Despesa
              </button>
            </form>

            {/* Listagem de Despesas */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${currentTheme.border}`, color: "#8C8C8C" }}>
                    <th style={{ padding: "0.5rem" }}>Categoria</th>
                    <th style={{ padding: "0.5rem" }}>Fornecedor</th>
                    <th style={{ padding: "0.5rem" }}>Estimado</th>
                    <th style={{ padding: "0.5rem" }}>Valor Real</th>
                    <th style={{ padding: "0.5rem" }}>Valor Pago</th>
                    <th style={{ padding: "0.5rem" }}>Devido em</th>
                    <th style={{ padding: "0.5rem" }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {plannerData.expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#8C8C8C" }}>
                        Nenhuma despesa lançada. Adicione uma despesa acima! ✨
                      </td>
                    </tr>
                  ) : (
                    plannerData.expenses.map(exp => (
                      <tr key={exp.id} style={{ borderBottom: `1px solid ${currentTheme.border}` }}>
                        <td style={{ padding: "0.6rem 0.5rem", fontWeight: 800 }}>{exp.category}</td>
                        <td style={{ padding: "0.6rem 0.5rem" }}>{exp.vendor}</td>
                        <td style={{ padding: "0.6rem 0.5rem" }}>R$ {exp.estimated.toLocaleString("pt-BR")}</td>
                        <td style={{ padding: "0.6rem 0.5rem", fontWeight: 800 }}>R$ {exp.actual.toLocaleString("pt-BR")}</td>
                        <td style={{ padding: "0.6rem 0.5rem", color: exp.paid >= exp.actual ? "#2E7D32" : "#9B7E1A", fontWeight: 800 }}>
                          R$ {exp.paid.toLocaleString("pt-BR")}
                        </td>
                        <td style={{ padding: "0.6rem 0.5rem" }}>
                          {new Date(exp.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                        </td>
                        <td style={{ padding: "0.6rem 0.5rem" }}>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            style={{ border: "none", background: "none", cursor: "pointer", color: "#A85361" }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: GUESTS ==================== */}
        {activeTab === "guests" && (
          <div
            style={{
              background: currentTheme.cardBg,
              border: `1.5px solid ${currentTheme.border}`,
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.accent, textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                  Lista de Presenças
                </span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: currentTheme.text, margin: 0 }}>
                  Gestão de Convidados & RSVP 👥
                </h2>
              </div>

              {/* Filtros */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input
                  value={guestSearch}
                  onChange={e => setGuestSearch(e.target.value)}
                  placeholder="Buscar convidado..."
                  style={{
                    background: "#FFF",
                    border: `1.5px solid ${currentTheme.border}`,
                    borderRadius: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.72rem",
                    outline: "none"
                  }}
                />
                <select
                  value={guestFilterRsvp}
                  onChange={e => setGuestFilterRsvp(e.target.value as any)}
                  style={{
                    background: "#FFF",
                    border: `1.5px solid ${currentTheme.border}`,
                    borderRadius: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: currentTheme.text,
                    cursor: "pointer"
                  }}
                >
                  <option value="todos">Todos RSVPs</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="pendente">Pendentes</option>
                  <option value="recusado">Recusados</option>
                </select>
              </div>
            </div>

            {/* Cadastro de convidado */}
            <form onSubmit={handleAddGuest} style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", background: "#FFFBF2", padding: "1rem", borderRadius: "1rem", border: `1.5px dashed ${currentTheme.border}` }}>
              <input
                value={newGuestName}
                onChange={e => setNewGuestName(e.target.value)}
                placeholder="Nome do Convidado"
                style={{ flex: 1, minWidth: "180px", background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              />
              <select
                value={newGuestSide}
                onChange={e => setNewGuestSide(e.target.value as any)}
                style={{ background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              >
                <option value="noiva">Família Noiva</option>
                <option value="noivo">Família Noivo</option>
                <option value="outro">Amigos / Comum</option>
              </select>
              <select
                value={newGuestDiet}
                onChange={e => setNewGuestDiet(e.target.value as any)}
                style={{ background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              >
                <option value="normal">Dieta Normal</option>
                <option value="vegano">Vegano</option>
                <option value="vegetariano">Vegetariano</option>
                <option value="sem_gluten">Sem Glúten</option>
              </select>
              <select
                value={newGuestRsvp}
                onChange={e => setNewGuestRsvp(e.target.value as any)}
                style={{ background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
              >
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="recusado">Recusado</option>
              </select>
              <button
                type="submit"
                style={{ background: currentTheme.primary, color: "#FFF", border: "none", borderRadius: "0.5rem", padding: "0.4rem 0.9rem", fontSize: "0.78rem", fontWeight: 800, cursor: "pointer" }}
              >
                + Convidado
              </button>
            </form>

            {/* Listagem */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${currentTheme.border}`, color: "#8C8C8C" }}>
                    <th style={{ padding: "0.5rem" }}>Nome</th>
                    <th style={{ padding: "0.5rem" }}>Lado</th>
                    <th style={{ padding: "0.5rem" }}>Restrição Alimentar</th>
                    <th style={{ padding: "0.5rem" }}>Status RSVP</th>
                    <th style={{ padding: "0.5rem" }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#8C8C8C" }}>
                        Nenhum convidado encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map(g => (
                      <tr key={g.id} style={{ borderBottom: `1px solid ${currentTheme.border}` }}>
                        <td style={{ padding: "0.6rem 0.5rem", fontWeight: 800 }}>{g.name}</td>
                        <td style={{ padding: "0.6rem 0.5rem", textTransform: "capitalize" }}>{g.side === "outro" ? "Amigos" : `Família ${g.side}`}</td>
                        <td style={{ padding: "0.6rem 0.5rem", textTransform: "capitalize" }}>{g.diet.replace("_", " ")}</td>
                        <td style={{ padding: "0.6rem 0.5rem" }}>
                          <select
                            value={g.rsvp}
                            onChange={e => updateGuestField(g.id, "rsvp", e.target.value as any)}
                            style={{
                              background: g.rsvp === "confirmado" ? "#E2F0DD" : g.rsvp === "pendente" ? "#FFF2CC" : "#FCE4E6",
                              border: "1px solid rgba(0,0,0,0.1)",
                              color: g.rsvp === "confirmado" ? "#2E7D32" : g.rsvp === "pendente" ? "#B7791F" : "#C53030",
                              borderRadius: "0.4rem",
                              padding: "0.15rem 0.35rem",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              cursor: "pointer"
                            }}
                          >
                            <option value="confirmado">Confirmado</option>
                            <option value="pendente">Pendente</option>
                            <option value="recusado">Recusado</option>
                          </select>
                        </td>
                        <td style={{ padding: "0.6rem 0.5rem" }}>
                          <button
                            onClick={() => deleteGuest(g.id)}
                            style={{ border: "none", background: "none", cursor: "pointer", color: "#A85361" }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: TABLES ==================== */}
        {activeTab === "tables" && (
          <div
            style={{
              background: currentTheme.cardBg,
              border: `1.5px solid ${currentTheme.border}`,
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "2rem"
            }}
          >
            {/* Sidebar com convidados confirmados não assentados */}
            <div className="no-print">
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.accent, textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Organizador de Assentos
              </span>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: currentTheme.text, margin: "0 0 1rem" }}>
                Lista de Convidados 🍽️
              </h2>
              <p style={{ fontSize: "0.75rem", color: "#8C8C8C", margin: "0 0 1rem", lineHeight: 1.4 }}>
                Arraste os convidados confirmados abaixo e solte-os em uma cadeira de qualquer mesa no salão!
              </p>

              {/* Listagem lateral */}
              <div style={{ background: "#FAF8F2", padding: "1rem", borderRadius: "1rem", border: `1.5px solid ${currentTheme.border}` }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.primary, display: "block", marginBottom: "0.5rem" }}>
                  Confirmados Sem Mesa ({plannerData.guests.filter(g => g.rsvp === "confirmado" && !g.tableId).length})
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "250px", overflowY: "auto", padding: "0.2rem" }}>
                  {plannerData.guests.filter(g => g.rsvp === "confirmado" && !g.tableId).length === 0 ? (
                    <div style={{ fontSize: "0.7rem", color: "#8C8C8C", textAlign: "center", padding: "1.5rem" }}>
                      Nenhum convidado pendente de assento! 🎉
                    </div>
                  ) : (
                    plannerData.guests
                      .filter(g => g.rsvp === "confirmado" && !g.tableId)
                      .map(guest => (
                        <div
                          key={guest.id}
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.setData("guestId", guest.id);
                          }}
                          style={{
                            background: "#FFF",
                            border: `1.2px solid ${currentTheme.border}`,
                            borderRadius: "0.5rem",
                            padding: "0.45rem 0.6rem",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: currentTheme.text,
                            cursor: "grab",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                          }}
                          title="Arraste para uma mesa"
                        >
                          <span>{guest.side === "noiva" ? "🌸" : "🪵"}</span>
                          <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {guest.name}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Criador de Mesas */}
              <form onSubmit={handleAddTable} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem", background: "#FFF", padding: "1rem", borderRadius: "1rem", border: `1.5px dashed ${currentTheme.border}` }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.accent }}>Criar Nova Mesa</span>
                <input
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  placeholder="Nome da Mesa (Ex: Mesa 1)"
                  style={{ background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem", outline: "none" }}
                />
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <select
                    value={newTableShape}
                    onChange={e => setNewTableShape(e.target.value as any)}
                    style={{ flex: 1, background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem", fontSize: "0.78rem", outline: "none" }}
                  >
                    <option value="circle">Redonda</option>
                    <option value="rectangle">Retangular</option>
                  </select>
                  <input
                    type="number"
                    value={newTableSeats}
                    onChange={e => setNewTableSeats(parseInt(e.target.value) || 4)}
                    placeholder="Assentos"
                    style={{ width: "70px", background: "#FFF", border: `1.5px solid ${currentTheme.border}`, borderRadius: "0.5rem", padding: "0.4rem", fontSize: "0.78rem", outline: "none" }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: currentTheme.primary, color: "#FFF", border: "none", borderRadius: "0.5rem", padding: "0.4rem", fontSize: "0.78rem", fontWeight: 800, cursor: "pointer" }}
                >
                  Adicionar Mesa
                </button>
              </form>
            </div>

            {/* Espaço das mesas físicas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#8C8C8C" }}>MAPA DO SALÃO</span>
                <button
                  className="no-print"
                  onClick={() => window.print()}
                  style={{
                    background: "none",
                    border: "none",
                    color: currentTheme.primary,
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem"
                  }}
                >
                  Imprimir Mapa de Assentos 🖨️
                </button>
              </div>

              {/* Grid das mesas */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "1.2rem",
                  background: "#FAF6F0",
                  border: `3px solid ${currentTheme.border}`,
                  borderRadius: "1.5rem",
                  padding: "1.5rem",
                  minHeight: "400px"
                }}
              >
                {plannerData.tables.map(table => {
                  const tableGuests = plannerData.guests.filter(g => g.tableId === table.id);

                  return (
                    <div
                      key={table.id}
                      style={{
                        background: "#FFF",
                        border: `1.5px solid ${currentTheme.border}`,
                        borderRadius: "1.2rem",
                        padding: "1rem",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: "220px",
                        justifyContent: "space-between",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.02)"
                      }}
                    >
                      {/* Título da mesa */}
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 900, color: currentTheme.text }}>
                          {table.name}
                        </span>
                        <button
                          className="no-print"
                          onClick={() => deleteTable(table.id)}
                          style={{ border: "none", background: "none", color: "#A85361", cursor: "pointer" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Desenho da Mesa */}
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "1rem 0"
                        }}
                      >
                        {/* Tampo da Mesa Principal */}
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: table.shape === "circle" ? "50%" : "0.5rem",
                            background: currentTheme.badgeBg,
                            border: `2px solid ${currentTheme.border}`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            color: currentTheme.badgeText,
                            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.05)"
                          }}
                        >
                          <span>{tableGuests.length} / {table.seatsCount}</span>
                          <span>Assentos</span>
                        </div>

                        {/* Renderizar as cadeiras ao redor */}
                        {Array.from({ length: table.seatsCount }).map((_, seatIdx) => {
                          const seatedGuest = tableGuests.find(g => g.seatIndex === seatIdx);
                          
                          // Calcular posições circulares ou lineares
                          let x = 0;
                          let y = 0;

                          if (table.shape === "circle") {
                            const radius = 48;
                            const angle = (seatIdx * 2 * Math.PI) / table.seatsCount;
                            x = 70 + radius * Math.cos(angle) - 14;
                            y = 70 + radius * Math.sin(angle) - 14;
                          } else {
                            // Retangular: Divide os assentos entre cima (top) e baixo (bottom)
                            const half = Math.ceil(table.seatsCount / 2);
                            const top = seatIdx < half;
                            const colIdx = top ? seatIdx : seatIdx - half;
                            const colCount = top ? half : table.seatsCount - half;

                            x = colCount > 1 ? 15 + (colIdx * (110 / (colCount - 1))) : 55;
                            y = top ? 12 : 108;
                          }

                          return (
                            <div
                              key={seatIdx}
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => {
                                const guestId = e.dataTransfer.getData("guestId");
                                handleSeatGuest(guestId, table.id, seatIdx);
                              }}
                              style={{
                                position: "absolute",
                                left: x,
                                top: y,
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                border: `1.5px dashed ${seatedGuest ? currentTheme.primary : "#8C8C8C"}`,
                                background: seatedGuest ? (seatedGuest.side === "noiva" ? "#FCE4E6" : "#EFE6DD") : "#FFF",
                                cursor: seatedGuest ? "default" : "grab",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                color: currentTheme.text,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                              }}
                              title={seatedGuest ? seatedGuest.name : "Vazio. Arraste um convidado para sentar."}
                            >
                              {seatedGuest ? (
                                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <span style={{ fontSize: "0.55rem" }}>
                                    {seatedGuest.name.split(" ")[0].slice(0, 3)}
                                  </span>
                                  <button
                                    className="no-print"
                                    onClick={() => handleUnseatGuest(seatedGuest.id)}
                                    style={{
                                      position: "absolute",
                                      top: -6,
                                      right: -6,
                                      background: "#E63946",
                                      color: "#FFF",
                                      border: "none",
                                      borderRadius: "50%",
                                      width: 12,
                                      height: 12,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 7,
                                      cursor: "pointer",
                                      fontWeight: 900
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                "+"
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: MOODBOARD ==================== */}
        {activeTab === "moodboard" && (
          <div
            style={{
              background: currentTheme.cardBg,
              border: `1.5px solid ${currentTheme.border}`,
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.accent, textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                  Mural de Inspiração
                </span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: currentTheme.text, margin: 0 }}>
                  Moodboard & Fotos 🌸
                </h2>
              </div>

              {/* Upload de Imagens */}
              <label
                style={{
                  background: currentTheme.badgeBg,
                  color: currentTheme.badgeText,
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <Camera size={14} /> Carregar Foto
                <input type="file" accept="image/*" onChange={handleMoodPhotoUpload} style={{ display: "none" }} />
              </label>
            </div>

            {/* Painel Central do Moodboard */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 3.5fr", gap: "1.5rem" }}>
              {/* Painel de Adesivos */}
              <div style={{ background: "#FAF8F2", padding: "1rem", borderRadius: "1rem", border: `1.5px solid ${currentTheme.border}` }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: currentTheme.primary, display: "block", marginBottom: "0.5rem" }}>
                  Adesivos de Casamento
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {WEDDING_STICKERS.map(st => (
                    <button
                      key={st.id}
                      onClick={() => addMoodSticker(st.label)}
                      style={{
                        background: "#FFF",
                        border: `1.2px solid ${currentTheme.border}`,
                        borderRadius: "0.5rem",
                        padding: "0.5rem",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                      }}
                      title={st.label}
                    >
                      {st.label.split(" ")[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quadro / Canvas Interativo */}
              <div
                ref={moodboardRef}
                onMouseMove={handleMoodMouseMove}
                onMouseUp={handleMoodMouseUp}
                onMouseLeave={handleMoodMouseUp}
                style={{
                  background: "#FFFBF5",
                  border: `3px dashed ${currentTheme.border}`,
                  borderRadius: "1.5rem",
                  height: "450px",
                  position: "relative",
                  overflow: "hidden",
                  backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 15%, transparent 16%)",
                  backgroundSize: "20px 20px"
                }}
              >
                {plannerData.moodboard.length === 0 ? (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#8C8C8C", fontSize: "0.8rem", textAlign: "center" }}>
                    Quadro vazio. Clique em "Carregar Foto" ou escolha um adesivo lateral para começar a colar! 🌸
                  </div>
                ) : (
                  plannerData.moodboard.map(item => {
                    const isSelected = selectedMoodId === item.id;

                    return (
                      <div
                        key={item.id}
                        onMouseDown={e => handleMoodMouseDown(item.id, e)}
                        style={{
                          position: "absolute",
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                          cursor: "move",
                          zIndex: isSelected ? 10 : 2,
                          userSelect: "none"
                        }}
                      >
                        {item.type === "sticker" ? (
                          <div style={{ fontSize: "2rem", padding: "0.2rem" }}>
                            {item.content.split(" ")[1]}
                          </div>
                        ) : (
                          <div
                            style={{
                              background: "#FFF",
                              border: "1px solid #CCC",
                              padding: "0.4rem 0.4rem 1.2rem 0.4rem",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
                              maxWidth: "110px"
                            }}
                          >
                            <img
                              src={item.content}
                              alt="Inspiration"
                              draggable={false}
                              style={{ width: "100%", height: "85px", objectFit: "cover" }}
                            />
                          </div>
                        )}

                        {/* Menu de ações do item */}
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              top: -30,
                              left: "50%",
                              transform: `translateX(-50%) scale(${1 / item.scale})`,
                              background: "#FFF",
                              border: "1px solid #000",
                              borderRadius: "0.3rem",
                              display: "flex",
                              gap: "0.15rem",
                              padding: "0.15rem",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                              zIndex: 100
                            }}
                            onMouseDown={e => e.stopPropagation()}
                          >
                            <button
                              onClick={() => updateMoodItem(item.id, { rotation: (item.rotation + 15) % 360 })}
                              style={{ border: "none", background: "none", cursor: "pointer", fontSize: 9 }}
                            >
                              <RotateCw size={10} />
                            </button>
                            <button
                              onClick={() => updateMoodItem(item.id, { scale: Math.min(3, item.scale + 0.15) })}
                              style={{ border: "none", background: "none", cursor: "pointer", fontSize: 9, fontWeight: 900 }}
                            >
                              +
                            </button>
                            <button
                              onClick={() => updateMoodItem(item.id, { scale: Math.max(0.5, item.scale - 0.15) })}
                              style={{ border: "none", background: "none", cursor: "pointer", fontSize: 9, fontWeight: 900 }}
                            >
                              -
                            </button>
                            <button
                              onClick={() => deleteMoodItem(item.id)}
                              style={{ border: "none", background: "none", cursor: "pointer", color: "#A85361", fontSize: 9 }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles Sheet para imprimir somente o voucher ou o diário inteiro */}
      <style>{`
        @media print {
          /* Estilo de ocultação de base */
          body * {
            visibility: hidden;
          }

          /* Se o modal estiver aberto, imprime APENAS o voucher */
          .modal-open-print .main-print-container {
            display: none !important;
          }
          .modal-open-print .modal-backdrop-print,
          .modal-open-print .modal-backdrop-print * {
            visibility: visible !important;
          }
          .modal-open-print .modal-content-print,
          .modal-open-print .modal-content-print * {
            visibility: visible !important;
          }
          .modal-open-print .printable-voucher,
          .modal-open-print .printable-voucher * {
            visibility: visible !important;
          }
          .modal-open-print .printable-voucher {
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%) scale(1.3);
            width: 100%;
            max-width: 480px;
            box-shadow: none !important;
            border: 3px dashed ${currentTheme.accent} !important;
            background: #FFFDFB !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .modal-open-print .modal-backdrop-print {
            visibility: visible !important;
            background: transparent !important;
            position: absolute !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }

          /* Se o modal NÃO estiver aberto, imprime a página de diário/scrapbook ativa */
          :not(.modal-open-print) .modal-backdrop-print {
            display: none !important;
          }
          :not(.modal-open-print) .main-print-container,
          :not(.modal-open-print) .main-print-container * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          :not(.modal-open-print) .main-print-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Ocultar elementos não imprimíveis */
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
