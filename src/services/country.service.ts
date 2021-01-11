import { DB } from "../utils/DB";

export const getCountriesByClientId = async ({ ClientId, columns }: { ClientId: string, columns: any }) => {

    return await DB?.select({ Code: "countries.code", ...columns })
        .from("countries")
        .leftJoin('companies_locations', 'companies_locations.country', 'countries.code')
        .leftJoin('clients', 'companies_locations.clientId', 'clients.id')
        .where("clients.id", ClientId)
        .groupBy('countries.code');

}