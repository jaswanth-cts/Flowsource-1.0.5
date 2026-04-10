import { LoggerService } from '@backstage/backend-plugin-api';
import path from 'path';
import { CatalogClient } from '@backstage/catalog-client';

export class CatalogServiceHelper {

    logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
    }

    /**
     * Get the appids of all the entities in the catalog.
     */
    async getEntitiesAppId(catalogClient: CatalogClient, token: string): Promise<string[]> {
        const { items } = await catalogClient.getEntities(
            {
                fields: ['metadata.appid'],
                filter: {
                    kind: 'Component',
                    'spec.type': ['service', 'website'],
                },
            },
            { token, }
        );
        return items
            .filter(item => item.metadata && item.metadata.appid)
            .map(item => item.metadata.appid as string);
    }

    /**
     * Get the techdocs details of the entity.
     */
    async getEntityTechDocDetails(catalogClient: CatalogClient, appid: string, token: string): Promise<TechDocDetails> {
        const { items } = await catalogClient.getEntities(
            {
                fields: ['metadata.annotations'],
                filter: {
                    kind: 'Component',
                    'spec.type': ['service', 'website'],
                    'metadata.appid' : appid
                },
            },
            { token, }
        );

        if (!items || items.length === 0) {
            throw new Error(`No entity found for appid ${appid}`);
        }

        const entity = items[0];
        return {
            'backstage.io/techdocs-ref': entity.metadata.annotations?.['backstage.io/techdocs-ref'] as string,
            'backstage.io/managed-by-location': entity.metadata.annotations?.['backstage.io/managed-by-location'],
        };
    }

    /**
     * Get the repository URL of the folder containing docs.
    */
    getDocsFolderParentUrl(techDocDetails: TechDocDetails) {
        const techdocsRef = techDocDetails['backstage.io/techdocs-ref'];
        const managedByLocation = techDocDetails['backstage.io/managed-by-location'];
        if (!techdocsRef || !managedByLocation) {
            throw new Error('Invalid techdocs-ref or managed-by-location');
        } else if (techdocsRef.startsWith('dir:')) {
            // Remove the catalog-info.yaml path from the managedByLocation URL
            const url = new URL(managedByLocation.replace('url:', ''));
            const parts = url.pathname.split('/');
            parts.pop(); // Remove the last part (catalog-info.yaml)
            url.pathname = parts.join('/');
            return url.toString();
        } else if (techdocsRef.startsWith('url:')) {
            return techdocsRef.replace('url:', '');
        } else {
            throw new Error(`Invalid techdocs-ref: ${techdocsRef}`);
        }
    }

    /**
     * Get the relative path of the docs folder
     */
    getDocsFolderRelativePath(techDocDetails: TechDocDetails): string {
        const techdocsRef = techDocDetails['backstage.io/techdocs-ref'];
        return this.getDocsFolderRelativePathFromRef(techdocsRef);
    }

    /**
     * Get the relative path of the docs folder from the techdocs-ref
     */
    getDocsFolderRelativePathFromRef(techDocsRef: string | undefined): string {
        if (!techDocsRef || !techDocsRef.startsWith('dir:')) {
            return 'docs';
        }
        const techdocsRefPath = techDocsRef.replace('dir:', '');
        const docsFolderPath = path.join(techdocsRefPath, 'docs');
        return docsFolderPath;
    }

}