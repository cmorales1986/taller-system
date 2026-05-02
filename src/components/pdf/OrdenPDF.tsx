import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#f97316" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImg: { width: 40, height: 40, borderRadius: 8 },
  logoTexts: { flexDirection: "column" },
  logo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#f97316" },
  logoSub: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  ordenNum: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "right" },
  estadoBadge: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", backgroundColor: "#f97316", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 6, textAlign: "center" },
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
  totalRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb", gap: 16 },
  totalLabel: { fontSize: 9, color: "#6b7280" },
  totalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#111827" },
  problemaBox: { backgroundColor: "#fff7ed", borderLeftWidth: 3, borderLeftColor: "#f97316", padding: 10, borderRadius: 4 },
  problemaText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
  firmaSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  firmaBox: { width: "45%", alignItems: "center" },
  firmaLinea: { borderTopWidth: 1, borderTopColor: "#9ca3af", width: "100%", marginBottom: 4 },
  firmaLabel: { fontSize: 8, color: "#6b7280" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
  footerText: { fontSize: 7, color: "#9ca3af" },
});

const ESTADOS: Record<string, string> = {
  recibido: "Recibido", en_diagnostico: "En diagnóstico",
  esperando_repuestos: "Esperando repuestos", en_reparacion: "En reparación",
  listo: "Listo", entregado: "Entregado", cancelado: "Cancelado",
};

interface Props { orden: any; }

export function OrdenPDF({ orden }: Props) {
  const fecha = new Date(orden.creado_en).toLocaleDateString("es-PY", { day: "2-digit", month: "long", year: "numeric" });
  const totalRepuestos = orden.or_repuestos?.reduce((acc: number, r: any) => acc + Number(r.subtotal), 0) || 0;
  const totalServicios = orden.or_servicios?.reduce((acc: number, s: any) => acc + Number(s.subtotal), 0) || 0;

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
            <Text style={styles.ordenNum}>OR-{String(orden.numero).padStart(4, "0")}</Text>
            <Text style={styles.estadoBadge}>{ESTADOS[orden.estado] || orden.estado}</Text>
            <Text style={{ fontSize: 8, color: "#6b7280", textAlign: "right", marginTop: 4 }}>{fecha}</Text>
          </View>
        </View>

        {/* Cliente + Vehículo */}
        <View style={[styles.section, styles.grid2]}>
          <View style={styles.gridItem}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.card}>
              <Text style={styles.value}>{orden.clientes?.nombre}</Text>
              {orden.clientes?.telefono && <Text style={[styles.label, { marginTop: 4 }]}>{orden.clientes.telefono}</Text>}
              {orden.clientes?.email && <Text style={styles.label}>{orden.clientes.email}</Text>}
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.sectionTitle}>Vehículo</Text>
            <View style={styles.card}>
              <Text style={styles.patenteBox}>{orden.vehiculos?.patente}</Text>
              <Text style={styles.value}>{orden.vehiculos?.marca} {orden.vehiculos?.modelo}</Text>
              <Text style={[styles.label, { marginTop: 2 }]}>
                {orden.vehiculos?.anio}{orden.vehiculos?.color ? ` · ${orden.vehiculos.color}` : ""}
                {orden.kilometraje ? ` · ${Number(orden.kilometraje).toLocaleString("es-PY")} km` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Problema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problema reportado</Text>
          <View style={styles.problemaBox}>
            <Text style={styles.problemaText}>{orden.descripcion_problema}</Text>
          </View>
          {orden.diagnostico && (
            <View style={[styles.card, { marginTop: 8 }]}>
              <Text style={styles.label}>Diagnóstico del mecánico</Text>
              <Text style={styles.problemaText}>{orden.diagnostico}</Text>
            </View>
          )}
          {orden.trabajo_realizado && (
            <View style={[styles.card, { marginTop: 4 }]}>
              <Text style={styles.label}>Trabajo realizado</Text>
              <Text style={styles.problemaText}>{orden.trabajo_realizado}</Text>
            </View>
          )}
        </View>

        {/* Repuestos */}
        {orden.or_repuestos?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repuestos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Descripción</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "center" }]}>Cant.</Text>
                <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>P. Unit.</Text>
                <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>Subtotal</Text>
              </View>
              {orden.or_repuestos.map((r: any, i: number) => (
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
        {orden.or_servicios?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mano de obra</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Descripción</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "center" }]}>Cant.</Text>
                <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>P. Unit.</Text>
                <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>Subtotal</Text>
              </View>
              {orden.or_servicios.map((s: any, i: number) => (
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
        <View style={styles.totalRow}>
          {totalRepuestos > 0 && (
            <Text style={styles.totalLabel}>Repuestos: {totalRepuestos.toLocaleString("es-PY")} Gs.</Text>
          )}
          {totalServicios > 0 && (
            <Text style={styles.totalLabel}>Mano de obra: {totalServicios.toLocaleString("es-PY")} Gs.</Text>
          )}
          <Text style={styles.totalValue}>Total: {Number(orden.total).toLocaleString("es-PY")} Gs.</Text>
        </View>

        {/* Fecha prometida */}
        {orden.fecha_prometida && (
          <View style={[styles.card, { marginTop: 16, backgroundColor: "#f0fdf4" }]}>
            <Text style={styles.label}>Fecha de entrega estimada</Text>
            <Text style={styles.value}>
              {new Date(orden.fecha_prometida).toLocaleDateString("es-PY", { day: "2-digit", month: "long", year: "numeric" })}
            </Text>
          </View>
        )}

        {/* Firmas */}
        <View style={styles.firmaSection}>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Firma del cliente</Text>
          </View>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>
              {orden.usuarios_ordenes_reparacion_asignado_aTousuarios?.nombre
                ? `Mecánico: ${orden.usuarios_ordenes_reparacion_asignado_aTousuarios.nombre}`
                : "Firma del mecánico"}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TallerSystem v1.0 — Desarrollado por CDM Software</Text>
          <Text style={styles.footerText}>OR-{String(orden.numero).padStart(4, "0")} · {fecha}</Text>
        </View>

      </Page>
    </Document>
  );
}