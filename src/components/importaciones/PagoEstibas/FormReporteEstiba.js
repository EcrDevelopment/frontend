import React, { useState } from "react";
import { Form, DatePicker, Button, message, Table } from 'antd';
import axiosInstance from '../../../axiosConfig';
import dayjs from "dayjs";

function ReporteEstiba() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [fechaInicio, setFechaInicio] = useState(null); // Estado para fechaInicio

    const handleOnFinish = async (values) => {
        setLoading(true);
        const fechaInicio = values.fechaInicio ? dayjs(values.fechaInicio).format("YYYY-MM-DD") : "";
        const fechaFin = values.fechaFin ? dayjs(values.fechaFin).format("YYYY-MM-DD") : "";

        try {
            const response = await axiosInstance.get("/importaciones/generar-reporte-estiba/", {
                params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
            });

            if (response.data.status === "success") {
                setReportData(response.data.data);
                message.success("Reporte generado correctamente");
            } else {
                message.warning(response.data.message || "No se encontraron datos");
                setReportData([]);
            }
        } catch (error) {
            console.error("Error al obtener el reporte:", error);
            message.error("Hubo un error al generar el reporte");
        } finally {
            setLoading(false);
        }
    };

    const disabledFechaFin = (current) => {
        return fechaInicio ? current && current.isBefore(fechaInicio, 'day') : false;
    };

    const columns = [
        { title: "Estado", dataIndex: "pago_estiba", key: "pago_estiba" },   
        { title: "Placa", dataIndex: "placa_llegada", key: "placa" },    
        { title: "DUA", dataIndex: "despacho__dua", key: "dua" },                
        { title: "Transportista", dataIndex: "despacho__transportista__nombre_transportista", key: "transportista" },
        { title: "S. Descargados", dataIndex: "sacos_descargados", key: "sacos_descargados" ,align: 'center' },
        { title: "Total a pagar", dataIndex: "total_a_pagar", key: "total_a_pagar" ,align: 'right', className: 'column-money' },
    ];

    return (
        <div className="w-full h-full p-4">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Reporte de Estiba</h2>
            <div className="flex flex-col w-full m-auto justify-items-center p-4 rounded-md shadow-md bg-gray-300">
                <Form form={form} onFinish={handleOnFinish} requiredMark={false} layout="inline">
                    <Form.Item label="Desde" name="fechaInicio" rules={[{ required: true, message: 'Selecciona una fecha' }]}>
                        <DatePicker 
                            format={"DD/MM/YYYY"} 
                            style={{ width: '100%' }} 
                            onChange={(date) => setFechaInicio(date)} 
                        />
                    </Form.Item>

                    <Form.Item label="Hasta" name="fechaFin" rules={[{ required: true, message: 'Selecciona una fecha' }]}>
                        <DatePicker 
                            format={"DD/MM/YYYY"} 
                            style={{ width: '100%' }} 
                            disabledDate={disabledFechaFin} 
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading}>
                        Generar
                    </Button>
                </Form>
            </div>

            <div className="w-full mt-4">
                <Table
                    dataSource={reportData}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />
            </div>
        </div>
    );
}

export default ReporteEstiba;
