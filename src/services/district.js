import { useCallback, useEffect, useState } from 'react';

const useGetDistricts = (provinceCode) => {
    const [districts, setDistricts] = useState([]);

    const getDistricts = useCallback(async () => {
        if (!provinceCode) return;

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts || []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quận/huyện:', error);
        }
    }, [provinceCode]);

    useEffect(() => {
        getDistricts();
    }, [getDistricts]);

    return { districts };
};

export default useGetDistricts;
