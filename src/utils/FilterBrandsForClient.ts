import { DB } from '../utils/DB';

export const FilterBrandsForClient = async (grcCode: string) => {
    const blockedBrands = (await DB?.select().from("BlockedBrands").where({ grcCode })) || []

    return (result: any) => {
        if (blockedBrands.length == 0) return true

        const brand = result.VehAvailCore[0].Vehicle[0].$.Brand
        return !blockedBrands
            .filter(i => i.supplierId == result.VehAvailCore[0].$.Supplier_ID)
            .map(r => r.brandName).includes(brand)
    }
}