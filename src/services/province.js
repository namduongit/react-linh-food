import { useCallback, useEffect, useState } from 'react';

const useGetProvinces = () => {
    const [provinces, setProvinces] = useState([]);

    const getProvinces = useCallback(async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/?depth=1');
            const data = await response.json();
            setProvinces(data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tỉnh:', error);
        }
    }, []);

    useEffect(() => {
        getProvinces();
    }, [getProvinces]);

    return { provinces };
};

export default useGetProvinces;
