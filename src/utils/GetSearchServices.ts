import { DB } from '../utils/DB';

export const GetSearchServices = async (supplierId: string) => {
    const services = (await DB?.select().from("ServicesMapping").where({ supplierId })) || []

    return services
}