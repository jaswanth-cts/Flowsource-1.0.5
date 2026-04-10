import { CatalogProcessor, CatalogProcessorEmit, processingResult } from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common'
import {
  Entity, entityKindSchemaValidator,
  getCompoundEntityRef,
  parseEntityRef,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  RELATION_DEPENDENCY_OF,
  RELATION_DEPENDS_ON,
  RELATION_PART_OF,
  RELATION_HAS_PART,
} from '@backstage/catalog-model';

// For an example of the JSONSchema format and how to use $ref markers to the
// base definitions, see:
// https://github.com/backstage/backstage/tree/master/packages/catalog-model/src/schema/kinds/Component.v1alpha1.schema.json
import environmentKindEntityV1Schema from '../schema/Environment.v1.schema.json';
import { EnvironmentEntityV1 } from '../entity/EnvironmentEntityV1';

export class EnvironmentEntitiesProcessor implements CatalogProcessor {
  // You often end up wanting to support multiple versions of your kind as you
  // iterate on the definition, so we keep each version inside this array as a
  // convenient pattern.
  private readonly validators = [
    // This is where we use the JSONSchema that we export from our isomorphic
    // package
    entityKindSchemaValidator(environmentKindEntityV1Schema),
  ];

  // Return processor name
  getProcessorName(): string {
    return 'EnvironmentEntitiesProcessor'
  }

  // validateEntityKind is responsible for signaling to the catalog processing
  // engine that this entity is valid and should therefore be submitted for
  // further processing.
  async validateEntityKind(entity: Entity): Promise<boolean> {
    for (const validator of this.validators) {
      // If the validator throws an exception, the entity will be marked as
      // invalid.
      if (validator(entity)) {
        return true;
      }
    }
    // Returning false signals that we don't know what this is, passing the
    // responsibility to other processors to try to validate it instead.
    return false;
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {

    if (entity.kind !== 'Environment') {
      return entity;
    }

    function doEmit(
      targets: string | string[] | undefined,
      context: { defaultKind?: string; defaultNamespace: string },
      outgoingRelation: string,
      incomingRelation: string,
    ): void {
      if (!targets) {
        return;
      }
      for (const target of [targets].flat()) {
        const targetRef = parseEntityRef(target, context);
        emit(
          processingResult.relation({
            source: selfRef,
            type: outgoingRelation,
            target: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
          }),
        );
        emit(
          processingResult.relation({
            source: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
            type: incomingRelation,
            target: selfRef,
          }),
        );
      }
    }

    console.log('Post Process Entity - EnvironmentEntitiesProcessor');

    const selfRef = getCompoundEntityRef(entity);
    const environment = entity as EnvironmentEntityV1;

    doEmit(
      environment.spec.owner,
      { defaultKind: 'Group', defaultNamespace: selfRef.namespace },
      RELATION_OWNED_BY,
      RELATION_OWNER_OF,
    );
    doEmit(
      environment.spec.subcomponentOf,
      { defaultKind: 'Component', defaultNamespace: selfRef.namespace },
      RELATION_PART_OF,
      RELATION_HAS_PART,
    );
    doEmit(
      environment.spec.dependsOn,
      { defaultNamespace: selfRef.namespace },
      RELATION_DEPENDS_ON,
      RELATION_DEPENDENCY_OF,
    );
    doEmit(
      environment.spec.dependencyOf,
      { defaultNamespace: selfRef.namespace },
      RELATION_DEPENDENCY_OF,
      RELATION_DEPENDS_ON,
    );
    doEmit(
      environment.spec.system,
      { defaultKind: 'System', defaultNamespace: selfRef.namespace },
      RELATION_PART_OF,
      RELATION_HAS_PART,
    );

    console.log('Post Process Entity - EnvironmentEntitiesProcessor - Completed');

    return entity;
  }

}
