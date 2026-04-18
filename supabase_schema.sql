-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "estado_factura" AS ENUM ('emitida', 'pagada', 'anulada');

-- CreateEnum
CREATE TYPE "estado_or" AS ENUM ('recibido', 'en_diagnostico', 'esperando_repuestos', 'en_reparacion', 'listo', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "estado_presupuesto" AS ENUM ('borrador', 'enviado', 'aprobado', 'rechazado', 'vencido');

-- CreateEnum
CREATE TYPE "metodo_pago" AS ENUM ('efectivo', 'transferencia', 'tarjeta', 'cheque', 'credito');

-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('admin', 'mecanico', 'administrativo', 'consultas');

-- CreateEnum
CREATE TYPE "tipo_movimiento" AS ENUM ('entrada', 'salida', 'ajuste');

-- CreateTable
CREATE TABLE "categorias_repuesto" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "categorias_repuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(150) NOT NULL,
    "ruc_ci" VARCHAR(20),
    "telefono" VARCHAR(30),
    "email" VARCHAR(150),
    "direccion" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "numero" SERIAL NOT NULL,
    "orden_id" UUID,
    "cliente_id" UUID NOT NULL,
    "creado_por" UUID,
    "estado" "estado_factura" NOT NULL DEFAULT 'emitida',
    "metodo_pago" "metodo_pago",
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "iva_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "iva_monto" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notas" TEXT,
    "fecha_pago" TIMESTAMP(6),
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_stock" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "repuesto_id" UUID NOT NULL,
    "tipo" "tipo_movimiento" NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "stock_antes" INTEGER NOT NULL,
    "stock_despues" INTEGER NOT NULL,
    "orden_id" UUID,
    "usuario_id" UUID,
    "notas" TEXT,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "or_historial" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "orden_id" UUID NOT NULL,
    "usuario_id" UUID,
    "estado_anterior" "estado_or",
    "estado_nuevo" "estado_or" NOT NULL,
    "comentario" TEXT,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "or_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "or_repuestos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "orden_id" UUID NOT NULL,
    "repuesto_id" UUID,
    "descripcion" VARCHAR(200) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "or_repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "or_servicios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "orden_id" UUID NOT NULL,
    "servicio_id" UUID,
    "descripcion" VARCHAR(200) NOT NULL,
    "mecanico_id" UUID,
    "cantidad" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "or_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_reparacion" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "numero" SERIAL NOT NULL,
    "presupuesto_id" UUID,
    "vehiculo_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "asignado_a" UUID,
    "creado_por" UUID,
    "estado" "estado_or" NOT NULL DEFAULT 'recibido',
    "kilometraje" INTEGER,
    "descripcion_problema" TEXT NOT NULL,
    "diagnostico" TEXT,
    "trabajo_realizado" TEXT,
    "notas" TEXT,
    "fecha_prometida" TIMESTAMP(6),
    "fecha_entrega" TIMESTAMP(6),
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordenes_reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuesto_repuestos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "presupuesto_id" UUID NOT NULL,
    "repuesto_id" UUID,
    "descripcion" VARCHAR(200) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "presupuesto_repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuesto_servicios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "presupuesto_id" UUID NOT NULL,
    "servicio_id" UUID,
    "descripcion" VARCHAR(200) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "presupuesto_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuestos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "numero" SERIAL NOT NULL,
    "vehiculo_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "creado_por" UUID,
    "estado" "estado_presupuesto" NOT NULL DEFAULT 'borrador',
    "kilometraje" INTEGER,
    "notas" TEXT,
    "validez_dias" SMALLINT NOT NULL DEFAULT 15,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "fecha_aprobacion" TIMESTAMP(6),
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presupuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repuestos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "categoria_id" UUID,
    "codigo" VARCHAR(60),
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "marca" VARCHAR(80),
    "unidad" VARCHAR(20) NOT NULL DEFAULT 'unidad',
    "precio_costo" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "precio_venta" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "rol_usuario" NOT NULL DEFAULT 'mecanico',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "cliente_id" UUID NOT NULL,
    "patente" VARCHAR(20) NOT NULL,
    "marca" VARCHAR(80) NOT NULL,
    "modelo" VARCHAR(80) NOT NULL,
    "anio" SMALLINT,
    "color" VARCHAR(50),
    "vin" VARCHAR(50),
    "kilometraje" INTEGER,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marca_modelo" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "marca_id" UUID NOT NULL,
    "modelo_id" UUID NOT NULL,

    CONSTRAINT "marca_modelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas_vehiculo" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "marcas_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos_vehiculo" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modelos_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_repuesto_nombre_key" ON "categorias_repuesto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numero_key" ON "facturas"("numero");

-- CreateIndex
CREATE INDEX "idx_facturas_cliente" ON "facturas"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_facturas_estado" ON "facturas"("estado");

-- CreateIndex
CREATE INDEX "idx_facturas_orden" ON "facturas"("orden_id");

-- CreateIndex
CREATE INDEX "idx_movstock_repuesto" ON "movimientos_stock"("repuesto_id");

-- CreateIndex
CREATE INDEX "idx_or_historial_orden" ON "or_historial"("orden_id");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_reparacion_numero_key" ON "ordenes_reparacion"("numero");

-- CreateIndex
CREATE INDEX "idx_or_asignado" ON "ordenes_reparacion"("asignado_a");

-- CreateIndex
CREATE INDEX "idx_or_cliente" ON "ordenes_reparacion"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_or_estado" ON "ordenes_reparacion"("estado");

-- CreateIndex
CREATE INDEX "idx_or_vehiculo" ON "ordenes_reparacion"("vehiculo_id");

-- CreateIndex
CREATE UNIQUE INDEX "presupuestos_numero_key" ON "presupuestos"("numero");

-- CreateIndex
CREATE INDEX "idx_presupuestos_cliente" ON "presupuestos"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_presupuestos_estado" ON "presupuestos"("estado");

-- CreateIndex
CREATE INDEX "idx_presupuestos_vehiculo" ON "presupuestos"("vehiculo_id");

-- CreateIndex
CREATE UNIQUE INDEX "repuestos_codigo_key" ON "repuestos"("codigo");

-- CreateIndex
CREATE INDEX "idx_repuestos_categoria" ON "repuestos"("categoria_id");

-- CreateIndex
CREATE INDEX "idx_repuestos_codigo" ON "repuestos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_patente_key" ON "vehiculos"("patente");

-- CreateIndex
CREATE INDEX "idx_vehiculos_cliente" ON "vehiculos"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_vehiculos_patente" ON "vehiculos"("patente");

-- CreateIndex
CREATE UNIQUE INDEX "marca_modelo_marca_id_modelo_id_key" ON "marca_modelo"("marca_id", "modelo_id");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_vehiculo_nombre_key" ON "marcas_vehiculo"("nombre");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_reparacion"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_reparacion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_repuesto_id_fkey" FOREIGN KEY ("repuesto_id") REFERENCES "repuestos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "or_historial" ADD CONSTRAINT "or_historial_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_reparacion"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "or_historial" ADD CONSTRAINT "or_historial_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "or_repuestos" ADD CONSTRAINT "or_repuestos_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_reparacion"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "or_repuestos" ADD CONSTRAINT "or_repuestos_repuesto_id_fkey" FOREIGN KEY ("repuesto_id") REFERENCES "repuestos"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "or_servicios" ADD CONSTRAINT "or_servicios_mecanico_id_fkey" FOREIGN KEY ("mecanico_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "or_servicios" ADD CONSTRAINT "or_servicios_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_reparacion"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "or_servicios" ADD CONSTRAINT "or_servicios_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordenes_reparacion" ADD CONSTRAINT "ordenes_reparacion_asignado_a_fkey" FOREIGN KEY ("asignado_a") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordenes_reparacion" ADD CONSTRAINT "ordenes_reparacion_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordenes_reparacion" ADD CONSTRAINT "ordenes_reparacion_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordenes_reparacion" ADD CONSTRAINT "ordenes_reparacion_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuestos"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordenes_reparacion" ADD CONSTRAINT "ordenes_reparacion_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presupuesto_repuestos" ADD CONSTRAINT "presupuesto_repuestos_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuestos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presupuesto_repuestos" ADD CONSTRAINT "presupuesto_repuestos_repuesto_id_fkey" FOREIGN KEY ("repuesto_id") REFERENCES "repuestos"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presupuesto_servicios" ADD CONSTRAINT "presupuesto_servicios_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuestos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presupuesto_servicios" ADD CONSTRAINT "presupuesto_servicios_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "repuestos" ADD CONSTRAINT "repuestos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_repuesto"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marca_modelo" ADD CONSTRAINT "marca_modelo_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas_vehiculo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marca_modelo" ADD CONSTRAINT "marca_modelo_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos_vehiculo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

