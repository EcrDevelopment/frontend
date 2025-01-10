import React, { useState, useEffect } from 'react';
import { Collapse, notification, Button } from 'antd';
import axiosInstance from '../../../axiosConfig';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import TablaCalculo from './TablaCalculo';
import FormularioCalculo from './FormularioCalculo';
import FormularioExtra from './FormularioExtra';


function CalculoFlete() {
    const [dataForm, setDataForm] = useState({});
    const [dataTable, setDataTable] = useState([]);
    const [dataExtraForm, setDataExtraForm] = useState({});
    const [statuses, setStatuses] = useState({
        data1: false,
        data2: false,
        data3: false,
    });
    const [activeKeys, setActiveKeys] = useState(['1']);

    // Cargar datos desde localStorage al inicializar el componente
    useEffect(() => {
        const savedDataForm = localStorage.getItem('importaciones_Data_Form');
        const savedDataTable = localStorage.getItem('importaciones_Data_Table');
        const savedDataExtra = localStorage.getItem('importaciones_Data_Extra');

        // Si hay datos, actualiza los estados correspondientes
        if (savedDataForm) {
            setDataForm(JSON.parse(savedDataForm));
            setStatuses((prev) => ({ ...prev, data1: true }));
        }
        if (savedDataTable) {
            setDataTable(JSON.parse(savedDataTable));
            setStatuses((prev) => ({ ...prev, data2: true }));
        }
        if (savedDataExtra) {
            setDataExtraForm(JSON.parse(savedDataExtra));
            setStatuses((prev) => ({ ...prev, data3: true }));
        }

        // Configurar las claves activas del Collapse
        const keys = [];
        if (savedDataForm) keys.push('1');
        if (savedDataTable) keys.push('2');
        if (savedDataExtra) keys.push('3');
        setActiveKeys(keys.length > 0 ? keys : ['1']);
    }, []);

    // Guardar datos en localStorage y actualizar estados
    const saveAndSharedData = (data, key) => {
        switch (key) {
            case 'data1':
                localStorage.setItem('importaciones_Data_Form', JSON.stringify(data));
                setDataForm(data);
                break;
            case 'data2':
                localStorage.setItem('importaciones_Data_Table', JSON.stringify(data));
                setDataTable(data);
                break;
            case 'data3':
                localStorage.setItem('importaciones_Data_Extra', JSON.stringify(data));
                setDataExtraForm(data);
                break;
            default:
                break;
        }
    };
    
    const handleCancel = () => {        
        localStorage.removeItem('importaciones_Data_Form');
        localStorage.removeItem('importaciones_Data_Table');
        localStorage.removeItem('importaciones_Data_Extra');
        window.location.reload(); 
    }



    // Manejar la validación de datos
    const handleValidation = (key, data) => {
        setStatuses((prev) => ({ ...prev, [key]: true }));
        setActiveKeys([String(parseInt(key[4], 10) + 1)]);
        notification.success({
            message: `Parte ${key[4]} completada`,
            description: 'Los datos se han enviado correctamente.',
        });
        saveAndSharedData(data, key);
    };

    // Manejar el envío final
    const handleDataFinal = () => {
        if (statuses.data1 && statuses.data2 && statuses.data3) {
            const data = { dataForm, dataTable, dataExtraForm };
            axiosInstance
                .post('/importaciones/generar_reporte/', data)
                .then((response) => {
                    const file = new Blob([response.data], { type: 'application/pdf' });
                    const fileURL = URL.createObjectURL(file);
                    window.open(fileURL, '_blank');
                    notification.success({
                        message: 'Buen trabajo',
                        description: 'Reporte generado correctamente.',
                    });
                })
                .catch((error) => {
                    notification.error({
                        message: 'OCURRIO UN ERROR',
                        description: 'error:' + error.response,
                    });
                    console.error('Error al generar el reporte:', error.response);
                });
        } else {
            notification.warning({
                message: 'ADVERTENCIA',
                description: 'Los datos a enviar no son válidos, complete correctamente el formulario.',
            });
        }
    };

    const handleDataFinalDetallada=()  => { 
        if(statuses.data1 && statuses.data2 && statuses.data3) {
            const data = { dataForm, dataTable, dataExtraForm };
            axiosInstance
                .post('/importaciones/generar_reporte_detallado/', data)
                .then((response) => {
                    const file = new Blob([response.data], { type: 'application/pdf' });
                    const fileURL = URL.createObjectURL(file);
                    window.open(fileURL, '_blank');
                    notification.success({
                        message: 'Buen trabajo',
                        description: 'Reporte generado correctamente.',
                    });
                })
                .catch((error) => {
                    console.error('Error al generar el reporte:', error.response);
                });
        }
    }

    // Manejar el cambio en Collapse
    const handleCollapseChange = (keys) => {
        setActiveKeys(keys);
    };

    // Configuración de las secciones del Collapse
    const collapseItems = [
        {
            key: '1',
            label: 'Primera parte - Datos de empresa de transporte y producto',
            content: <FormularioCalculo onDataValidate={(data) => handleValidation('data1', data)} initialData={dataForm} />,
            status: statuses.data1,
        },
        {
            key: '2',
            label: 'Segunda parte - Detalles de transporte',
            content: <TablaCalculo onDataValidate={(data) => handleValidation('data2', data)} initialData={dataTable} />,
            status: statuses.data2,
        },
        {
            key: '3',
            label: 'Otros datos',
            content: (
                <FormularioExtra
                    onDataValidate={(data) => handleValidation('data3', data)}
                    initialData={dataExtraForm}
                    precio={dataForm.precioProducto || 0}
                    cantidad={dataTable.length || 0}
                />
            ),
            status: statuses.data3,
        },
    ];

    const collapsePanels = collapseItems.map(({ key, label, content, status }) => ({
        key,
        label,
        extra: status ? <CheckCircleOutlined style={{ color: 'green' }} /> : <CloseCircleOutlined />,
        style: { backgroundColor: status ? 'rgba(16, 185, 129, 0.3)' : 'transparent' },
        children: content,
    }));

    return (
        <div className="p-2 lg:px-8 lg:py-8 m-auto w-full rounded-md shadow-md space-y-4 space-x-2">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">Cálculo de Fletes Exterior</h1>
            <Collapse activeKey={activeKeys} onChange={handleCollapseChange} items={collapsePanels} />
            {statuses.data3 && (
                <Button type="primary" onClick={handleDataFinal}>
                    Ver reporte
                </Button>                 
            )}
            {statuses.data1 && statuses.data2 && statuses.data3 && (
                <Button type="primary" onClick={handleDataFinalDetallada}>
                    Ver reporte detallado
                </Button>                 
            )}
            <Button color="danger" variant="solid" onClick={handleCancel}>
                Cancelar
            </Button>
        </div>
    );
}

export default CalculoFlete;
