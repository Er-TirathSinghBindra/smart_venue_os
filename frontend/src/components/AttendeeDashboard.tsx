"use client";
import { useState, useEffect } from "react";
import { Utensils, Droplets, Clock, ShoppingBag, ArrowLeft, CheckCircle2, QrCode } from "lucide-react";
import VenueMap from "./VenueMap";
import { API_URL } from "@/config";

export default function AttendeeDashboard() {
  const [concessions, setConcessions] = useState<any[]>([]);
  const [restrooms, setRestrooms] = useState<any[]>([]);
  const [view, setView] = useState<"dashboard" | "menu" | "confirmed">("dashboard");
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ id: string; pickupTime: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, rRes] = await Promise.all([
          fetch(`${API_URL}/api/concessions`),
          fetch(`${API_URL}/api/restrooms`)
        ]);
        const cData = await cRes.json();
        const rData = await rRes.json();
        setConcessions(cData.concessions);
        setRestrooms(rData.restrooms);
      } catch (err) {
        console.error("Failed to fetch attendee data", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "1", name: "Samosa (2pcs) & Chai", price: 40 },
    { id: "2", name: "Vada Pav Junction", price: 30 },
    { id: "3", name: "Butter Chicken Roll", price: 120 },
    { id: "4", name: "Paneer Tikka Platter", price: 150 },
  ];

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCompleteOrder = () => {
    setIsCompleting(true);
    setTimeout(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 10);
      setOrderDetails({
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        pickupTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setIsCompleting(false);
      setView("confirmed");
      setCart([]);
    }, 2000);
  };

  if (view === "menu") {
    return (
      <div className="attendee-grid">
        <button onClick={() => setView("dashboard")} className="back-btn" style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 className="title-gradient card-title" style={{ marginBottom: "1.5rem" }}>
            <Utensils size={20} /> Express Menu
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {menuItems.map((item) => (
              <div key={item.id} className="data-row" style={{ padding: "0.75rem 0" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>₹{item.price.toFixed(2)}</div>
                </div>
                <button onClick={() => addToCart(item)} className="add-btn" style={{ background: "rgba(59, 130, 246, 0.2)", color: "var(--accent-blue)", border: "1px solid rgba(59, 130, 246, 0.4)", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600 }}>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Your Order</h3>
            {cart.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                <span>{item.quantity}x {item.name}</span>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "var(--status-cong)", cursor: "pointer", padding: 0 }}>Remove</button>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", marginTop: "1rem", fontSize: "1.2rem" }}>
              <span>Total:</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            
            <button 
              className="order-btn" 
              onClick={handleCompleteOrder} 
              disabled={isCompleting}
              style={{ marginTop: "1.5rem", opacity: isCompleting ? 0.7 : 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              {isCompleting ? "Processing..." : "Complete Order"}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (view === "confirmed" && orderDetails) {
    return (
      <div className="attendee-grid">
        <div className="glass-panel" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
          <CheckCircle2 color="var(--status-clear)" size={64} style={{ margin: "0 auto 1.5rem" }} />
          <h2 className="title-gradient" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Order Confirmed!</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Your food is being prepared.</p>
          
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", display: "inline-block", textAlign: "left", minWidth: "250px" }}>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Order Number</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>#{orderDetails.id}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Est. Pickup Time</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--status-clear)" }}>{orderDetails.pickupTime}</div>
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Locker Pickup QR</div>
            <div style={{ background: "white", padding: "1rem", borderRadius: "12px", display: "inline-block" }}>
              <QrCode color="black" size={120} />
            </div>
          </div>

          <button className="order-btn" style={{ marginTop: "2rem" }} onClick={() => setView("dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="attendee-grid">
      <div>
        <VenueMap mode="attendee" concessionsData={concessions} />
      </div>

      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h2 className="title-gradient card-title">
          <Utensils size={20} /> Concessions Wait Times
        </h2>
        <div>
          {concessions.length === 0 ? "Loading backend data..." : concessions.map((stand, i) => (
            <div className="data-row" key={i}>
              <div>
                <div style={{ fontWeight: 600 }}>{stand.name}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  <Clock size={12} style={{ display: "inline", verticalAlign: "middle" }}/> {stand.wait_time_minutes} min wait
                </div>
              </div>
              <span className={`status-badge ${
                stand.status === "Normal" ? "status-clear" : 
                stand.status === "Busy" ? "status-mod" : "status-cong"
              }`}>
                {stand.status}
              </span>
            </div>
          ))}
        </div>
        
        <button className="order-btn" onClick={() => setView("menu")}>
          <ShoppingBag size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
          Express Pickup Order
        </button>
      </div>

      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h2 className="title-gradient card-title">
          <Droplets size={20} /> Restroom Occupancy
        </h2>
        <div>
          {restrooms.length === 0 ? "Loading backend data..." : restrooms.map((rr, i) => (
            <div className="data-row" key={i} style={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{rr.location}</span>
                <span className={`status-badge ${
                  rr.status === "Available" ? "status-clear" : 
                  rr.status === "Moderate" ? "status-mod" : "status-cong"
                }`}>
                  {rr.status} {rr.occupancy_percent}%
                </span>
              </div>
              <div className="progress-bg">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${rr.occupancy_percent}%`,
                    backgroundColor: rr.status === "Available" ? "var(--status-clear)" : rr.status === "Moderate" ? "var(--status-mod)" : "var(--status-cong)"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
