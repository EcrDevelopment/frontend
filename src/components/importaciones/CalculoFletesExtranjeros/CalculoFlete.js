import React, { useState, useEffect } from 'react';
import { Collapse, notification,Button } from 'antd';
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

    //funcion para pasar data desde el componente hijo al padre y guardar en navegador para evitar borrar
    function saveAndSharedData(data,key){
        switch (key) {
            case "data1":
                localStorage.setItem('importaciones_Data_Form', JSON.stringify(data));    
                setDataForm(data)
                break;
            case "data2":
                localStorage.setItem('importaciones_Data_Table', JSON.stringify(data)); 
                setDataTable(data);
                break;
            case "data3":
                localStorage.setItem('importaciones_Data_Extra', JSON.stringify(data)); 
                setDataExtraForm(data);
                break;
        
            default:
                break;
        }
    }


    const handleValidation = (key, data) => {
        console.log("Datos recibidos en handleValidation:", data);
        setStatuses((prev) => ({ ...prev, [key]: true }));
        //localStorage.setItem('dataForm', JSON.stringify(data));
        setActiveKeys([String(parseInt(key, 10) + 1)]);
        notification.success({
            message: `Parte ${key[4]} completada`,
            description: 'Los datos se han enviado correctamente.',
        });        
        saveAndSharedData(data,key);
    };

    const handleDataFinal=()=>{
        if(statuses.data1 && statuses.data2 && statuses.data3){
            const data={ dataForm, dataTable, dataExtraForm }
            console.log("data completa",data);
            axiosInstance.post('/importaciones/generar_reporte/', data)
            .then(response => {
                //console.log('Reporte generado:', response.data);
                // Crear un enlace temporal para abrir el archivo PDF en una nueva pestaña
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);

                // Abrir el PDF en una nueva pestaña
                window.open(fileURL, '_blank');
                notification.success({
                    message: 'Buen trabajo',
                    description: 'reporte generado correctamente',
                });
                
                // Aquí puedes manejar la respuesta del backend
            })
            .catch(error => {
                console.error('Error al generar el reporte:', error.response);
                // Aquí puedes manejar los errores
            });
        }else{
            notification.warning({
                message: 'ADVERTENCIA',
                description: 'Los datos a enviar no son validos, complete correctamente el formulario.',
            });
        }
        
       // console.log({ dataForm, dataTable, dataExtraForm })
    }

    useEffect(() => {
        // Recuperar claves activas al refrescar
        const keys = [];
        if (statuses.data1) keys.push('1');
        if (statuses.data2) keys.push('2');
        if (statuses.data3) keys.push('3');
        setActiveKeys(keys.length > 0 ? keys : ['1']);
    }, []);

    const handleCollapseChange = (keys) => {
        setActiveKeys(keys);
    };    

    const collapseItems = [
        {
            key: '1',
            label: 'Primera parte - Datos de empresa de transporte y producto',
            content: <FormularioCalculo onDataValidate={(data) => handleValidation('data1', data)} />,
            status: statuses.data1,
        },
        {
            key: '2',
            label: 'Segunda parte - Detalles de transporte',
            content: <TablaCalculo onDataValidate={(data) => handleValidation('data2', data)} />,
            status: statuses.data2,
        },
        {
            key: '3',
            label: 'Otros datos',
            content: <FormularioExtra onDataValidate={(data) => handleValidation('data3', data)}  precio={dataForm.precioProducto || 0} cantidad={dataTable.length || 0} />,
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
        <div className="p-2 lg:px-8 lg:py-8 m-auto w-full rounded-md shadow-md space-y-4">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">Cálculo de Fletes Exterior</h1>
            
            {/* 
            <Collapse activeKey={activeKeys} onChange={handleCollapseChange} items={[
                {
                    key: '1',
                    label: 'Primera parte - Datos de empresa de transporte y producto',
                    extra: genExtra(1),
                    style: {
                        backgroundColor: statuses.data1 ? 'rgba(16, 185, 129, 0.3)' : 'transparent'
                    },
                    children: (

                        <FormularioCalculo onDataValidate={(data) => handleValidation('data1', data)} />
                    )
                },
                {
                    key: '2',
                    label: 'Segunda parte - Detalles de transporte',
                    extra: genExtra(2),
                    style: {
                        backgroundColor: statuses.data2 ? 'rgba(16, 185, 129, 0.3)' : 'transparent'
                    },
                    children: <TablaCalculo onDataValidate={(data) => handleValidation('data2', data)}/>
                },
                {
                    key: '3',
                    label: 'Otros datos',
                    extra: genExtra(3),
                    style: {
                        backgroundColor: statuses.data3 ? 'rgba(16, 185, 129, 0.3)' : 'transparent'
                    },
                    children: (
                        <FormularioExtra onDataValidate={(data) => handleValidation('data3', data)} precio={dataForm.precioProducto} />
                    )
                }
            ]} />
             */}

           
                
            
            <Collapse activeKey={activeKeys} onChange={handleCollapseChange} items={collapsePanels} />
            {statuses.data3 && (
                <Button type="primary" onClick={handleDataFinal}>
                    Finalizar y Enviar
                </Button>
            )}
        </div>
    );
}

export default CalculoFlete;
