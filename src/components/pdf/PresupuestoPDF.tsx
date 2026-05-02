import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#f97316" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImg: { width: 40, height: 40, borderRadius: 8 },
  logoTexts: { flexDirection: "column" },
  logo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#f97316" },
  logoSub: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  presNum: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "right" },
  estadoBadge: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", backgroundColor: "#f97316", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 6, textAlign: "center" },
  validezBadge: { fontSize: 8, color: "#6b7280", textAlign: "right", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  grid2: { flexDirection: "row", gap: 16 },
  gridItem: { flex: 1 },
  card: { backgroundColor: "#f9fafb", borderRadius: 6, padding: 12, marginBottom: 8 },
  label: { fontSize: 7, color: "#6b7280", marginBottom: 2 },
  value: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },
  patenteBox: { backgroundColor: "#111827", color: "#ffffff", fontSize: 11, fontFamily: "Helvetica-Bold", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, alignSelf: "flex-start", marginBottom: 4 },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4 },
  tableHeaderText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tableCell: { fontSize: 9, color: "#374151" },
  totalBox: { backgroundColor: "#fff7ed", borderRadius: 8, padding: 16, marginTop: 16 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel: { fontSize: 9, color: "#6b7280" },
  totalValue: { fontSize: 9, color: "#374151" },
  totalFinalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#fed7aa" },
  totalFinalLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#ea580c" },
  totalFinalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#ea580c" },
  notasBox: { backgroundColor: "#f9fafb", borderRadius: 6, padding: 10, marginTop: 12 },
  notasText: { fontSize: 9, color: "#6b7280", lineHeight: 1.5 },
  validezBox: { backgroundColor: "#eff6ff", borderRadius: 6, padding: 10, marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  aprobacionBox: { backgroundColor: "#f0fdf4", borderRadius: 6, padding: 12, marginTop: 12 },
  firmaSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  firmaBox: { width: "45%", alignItems: "center" },
  firmaLinea: { borderTopWidth: 1, borderTopColor: "#9ca3af", width: "100%", marginBottom: 4 },
  firmaLabel: { fontSize: 8, color: "#6b7280" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
  footerText: { fontSize: 7, color: "#9ca3af" },
});

const ESTADOS: Record<string, string> = {
  borrador: "Borrador", enviado: "Enviado",
  aprobado: "Aprobado", rechazado: "Rechazado", vencido: "Vencido",
};

const ESTADOS_COLOR: Record<string, string> = {
  borrador: "#6b7280", enviado: "#2563eb",
  aprobado: "#16a34a", rechazado: "#dc2626", vencido: "#d97706",
};

interface Props { presupuesto: any; }

export function PresupuestoPDF({ presupuesto }: Props) {
  const fecha = new Date(presupuesto.creado_en).toLocaleDateString("es-PY", { day: "2-digit", month: "long", year: "numeric" });
  const vencimiento = new Date(presupuesto.creado_en);
  vencimiento.setDate(vencimiento.getDate() + presupuesto.validez_dias);
  const fechaVencimiento = vencimiento.toLocaleDateString("es-PY", { day: "2-digit", month: "long", year: "numeric" });

  const totalRepuestos = presupuesto.presupuesto_repuestos?.reduce((acc: number, r: any) => acc + Number(r.subtotal), 0) || 0;
  const totalServicios = presupuesto.presupuesto_servicios?.reduce((acc: number, s: any) => acc + Number(s.subtotal), 0) || 0;
  const estadoColor = ESTADOS_COLOR[presupuesto.estado] || "#f97316";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image src="/pdf_icon.png" style={styles.logoImg} />
            <View style={styles.logoTexts}>
              <Text style={styles.logo}>TallerSystem</Text>
              <Text style={styles.logoSub}>Sistema de Gestión de Taller</Text>
            </View>
          </View>
          <View>
            <Text style={styles.presNum}>P-{String(presupuesto.numero).padStart(4, "0")}</Text>
            <Text style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
              {ESTADOS[presupuesto.estado] || presupuesto.estado}
            </Text>
            <Text style={styles.validezBadge}>Emitido: {fecha}</Text>
            <Text style={styles.validezBadge}>Vence: {fechaVencimiento}</Text>
          </View>
        </View>

        {/* Cliente + Vehículo */}
        <View style={[styles.section, styles.grid2]}>
          <View style={styles.gridItem}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.card}>
              <Text style={styles.value}>{presupuesto.clientes?.nombre}</Text>
              {presupuesto.clientes?.ruc_ci && (
                <Text style={[styles.label, { marginTop: 4 }]}>RUC/CI: {presupuesto.clientes.ruc_ci}</Text>
              )}
              {presupuesto.clientes?.telefono && (
                <Text style={styles.label}>{presupuesto.clientes.telefono}</Text>
              )}
              {presupuesto.clientes?.email && (
                <Text style={styles.label}>{presupuesto.clientes.email}</Text>
              )}
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.sectionTitle}>Vehículo</Text>
            <View style={styles.card}>
              <Text style={styles.patenteBox}>{presupuesto.vehiculos?.patente}</Text>
              <Text style={styles.value}>{presupuesto.vehiculos?.marca} {presupuesto.vehiculos?.modelo}</Text>
              <Text style={[styles.label, { marginTop: 2 }]}>
                {presupuesto.vehiculos?.anio}{presupuesto.vehiculos?.color ? ` · ${presupuesto.vehiculos.color}` : ""}
                {presupuesto.kilometraje ? ` · ${Number(presupuesto.kilometraje).toLocaleString("es-PY")} km` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Repuestos */}
        {presupuesto.presupuesto_repuestos?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repuestos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Descripción</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "center" }]}>Cant.</Text>
                <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>P. Unit.</Text>
                <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>Subtotal</Text>
              </View>
              {presupuesto.presupuesto_repuestos.map((r: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{r.descripcion}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>{r.cantidad}</Text>
                  <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>{Number(r.precio_unitario).toLocaleString("es-PY")}</Text>
                  <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>{Number(r.subtotal).toLocaleString("es-PY")}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Servicios */}
        {presupuesto.presupuesto_servicios?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mano de obra / Servicios</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Descripción</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "center" }]}>Cant.</Text>
                <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>P. Unit.</Text>
                <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>Subtotal</Text>
              </View>
              {presupuesto.presupuesto_servicios.map((s: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{s.descripcion}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>{s.cantidad}</Text>
                  <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>{Number(s.precio_unitario).toLocaleString("es-PY")}</Text>
                  <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>{Number(s.subtotal).toLocaleString("es-PY")}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalBox}>
          {totalRepuestos > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal repuestos</Text>
              <Text style={styles.totalValue}>{totalRepuestos.toLocaleString("es-PY")} Gs.</Text>
            </View>
          )}
          {totalServicios > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal mano de obra</Text>
              <Text style={styles.totalValue}>{totalServicios.toLocaleString("es-PY")} Gs.</Text>
            </View>
          )}
          <View style={styles.totalFinalRow}>
            <Text style={styles.totalFinalLabel}>TOTAL PRESUPUESTO</Text>
            <Text style={styles.totalFinalValue}>{Number(presupuesto.total).toLocaleString("es-PY")} Gs.</Text>
          </View>
        </View>

        {/* Notas */}
        {presupuesto.notas && (
          <View style={styles.notasBox}>
            <Text style={[styles.label, { marginBottom: 4 }]}>Observaciones</Text>
            <Text style={styles.notasText}>{presupuesto.notas}</Text>
          </View>
        )}

        {/* Validez */}
        <View style={styles.validezBox}>
          <View>
            <Text style={[styles.label, { marginBottom: 2 }]}>Validez del presupuesto</Text>
            <Text style={[styles.value, { color: "#1d4ed8" }]}>{presupuesto.validez_dias} días corridos desde la emisión</Text>
          </View>
          <View>
            <Text style={[styles.label, { marginBottom: 2, textAlign: "right" }]}>Vence el</Text>
            <Text style={[styles.value, { color: "#1d4ed8", textAlign: "right" }]}>{fechaVencimiento}</Text>
          </View>
        </View>

        {/* Firma aprobación */}
        <View style={styles.firmaSection}>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Firma y aclaración del cliente</Text>
            <Text style={[styles.firmaLabel, { marginTop: 2 }]}>Aprobación del presupuesto</Text>
          </View>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Sello y firma del taller</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TallerSystem v1.0 — Desarrollado por CDM Software</Text>
          <Text style={styles.footerText}>P-{String(presupuesto.numero).padStart(4, "0")} · Válido hasta {fechaVencimiento}</Text>
        </View>

      </Page>
    </Document>
  );
}