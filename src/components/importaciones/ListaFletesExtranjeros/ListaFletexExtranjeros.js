import React, { useEffect, useState, useCallback } from "react";
import { Table, Dropdown, Space, Button, Tooltip, message } from "antd";
import { DownOutlined } from '@ant-design/icons';
import qs from "qs";
import axiosInstance from "../../../axiosConfig";
import dayjs from "dayjs";



const items = [
    {
        key: '1',
        label: 'Ver Reporte',
    },
    {
        key: '2',
        label: 'Ver Reporte 2',
    },
];

const handleMenuClick = (e, id) => {
    switch (e.key) {
        case '1':
            handleRecuperarData(id);
            break;
        case '2':
            message.success("opcion 2");
            break;
        default:
            console.log('Opción no reconocida');
    }
}

const handleRecuperarData = async (id) => {
    try {
        const response = await axiosInstance.get('/importaciones/listar-data-despacho/', {
            params: {
                id: id,                
            },
        });        

        console.log(response.data);
    } catch (error) {
        message.error('Error al buscar proveedor:', error);
    }
}

const handleGenerarReporte = (data) => {
    message.success('opcion 1');
}

const columns = [
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
        sorter: true,
    },
    {
        title: "Dua",
        dataIndex: "dua",
        key: "dua",
        sorter: true,
    },

    {
        title: "OC",
        dataIndex: "ordenes_compra",
        key: "oc",
        render: (ordenes) => (
            <div>
                {ordenes.map((oc) => (
                    <Tooltip
                        key={oc.numero_oc}
                        title={
                            <div>
                                <p className="color-red-500"><strong>N° recojo:</strong> {oc.numero_recojo}</p>
                                <p><strong>Producto:</strong> {oc.producto}</p>
                                <p><strong>Precio:</strong> ${oc.precio_producto}</p>
                            </div>
                        }
                    >
                        <span
                            style={{
                                backgroundColor: "#e0f7fa",
                                color: "#007b8f",
                                padding: "5px 8px",
                                margin: "3px",
                                borderRadius: "5px",
                                display: "inline-block",
                                cursor: "pointer"
                            }}
                        >
                            {oc.numero_oc}
                        </span>
                    </Tooltip>
                ))}
            </div>
        )
    },
    {
        title: "Fecha Numeración",
        dataIndex: "fecha_numeracion",
        key: "fecha_numeracion",
        sorter: true,
        render: (text) => text ? dayjs(text).format("DD/MM/YYYY") : "N/A",
    },
    {
        title: "Carta Porte",
        dataIndex: "carta_porte",
        key: "carta_porte",
        sorter: true,
    },
    {
        title: "Factura",
        dataIndex: "num_factura",
        key: "num_factura",
        sorter: true,
    },
    {
        title: "Flete Pactado",
        dataIndex: "flete_pactado",
        key: "flete_pactado",
        className: 'column-money',
        sorter: true,
    },
    {
        title: "Peso Neto CRT",
        dataIndex: "peso_neto_crt",
        key: "peso_neto_crt",
    },
    {
        title: 'Accciones',
        key: 'operation',
        render: (item) => (
            <Space size="middle">
                <Button color="red" variant="solid">Eliminar</Button>
                <Dropdown menu={{ items, onClick: (e) => handleMenuClick(e, item.id) }}>
                    <Button color="cyan" variant="solid">
                        <Space>
                            Ver
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </Space>
        ),
    },
];

const getParams = (params) => ({
    page: params.pagination?.current,
    page_size: params.pagination?.pageSize,
    sortField: params.sortField,
    sortOrder: params.sortOrder,
    filters: params.filters,
});

function ListadoFletes() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: { current: 1, pageSize: 10, position: ['bottomLeft'] },
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `/importaciones/listar-despachos/?${qs.stringify(getParams(tableParams))}`
            );

            if (response.data.status === "success") {
                setData(response.data.data);
                setTableParams((prev) => {
                    if (prev.pagination.total !== response.data.total_count) {
                        return {
                            ...prev,
                            pagination: {
                                ...prev.pagination,
                                total: response.data.total_count,
                            },
                        };
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
        setLoading(false);
    }, [tableParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams((prev) => ({
            ...prev,
            pagination,
            filters,
            sortOrder: sorter.order,
            sortField: sorter.field,
        }));

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };

    const expandedRowRender = (record) => {
        return (
            <div style={{ padding: "10px" }}>
                <p><strong>Proveedor:</strong> {record.proveedor_nombre}</p>
                <p><strong>Transportista:</strong> {record.transportista_nombre}</p>
            </div>
        );
    };

    return (
        <>
            <div>
                <h2 className="text-2xl font-bold m-3">
                    Listado de fletes
                </h2>
                <Table
                    columns={columns}
                    rowKey="id"
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    expandable={{ expandedRowRender }}
                    size="small"
                />
            </div>
        </>
    );
}

export default ListadoFletes;
