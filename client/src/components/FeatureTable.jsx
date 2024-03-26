import React from 'react'
import { DataGrid } from '@mui/x-data-grid';

const columns = [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'name', headerName: 'Name', width: 240 },
];

function FeatureTable({ features, selectedFeatureID, setSelectedFeatureID }) {
    let data = features.map(i => {
        return {
            id: i.values_.CNTR_ID,
            name: i.values_.CNTR_NAME,
        }
    })

    return (
        <div style={{ margin: '1em', height: '70vh', flex: '1 1 400px' }}>
            <DataGrid
                autoPageSize
                rows={data}
                columns={columns}
                filterModel={{ items: [{ field: 'id', operator: 'equals', value: selectedFeatureID }] }}
                rowSelectionModel={selectedFeatureID}
                sortModel={[{ field: 'id', sort: 'asc' }]}
                onRowSelectionModelChange={id => { setSelectedFeatureID(id[0]) }}
            />
        </div>
    )
}

export default FeatureTable