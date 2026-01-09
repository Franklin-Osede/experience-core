export interface ProductionRiderProps {
  audioRequirements?: string; // e.g. "L-Acoustics K1 System, DJ Booth with CDJ-3000s"
  lightingRequirements?: string; // e.g. "Strobe heavy, 40 moving heads, lasers"
  visualRequirements?: string; // e.g. "Large LED wall behind DJ"
  stageConfiguration?: string; // e.g. "DJ in center, raised 2m"
  requiresTechnician: boolean; // Does the event need a house technician?
}

export class ProductionRider {
  constructor(private readonly props: ProductionRiderProps) {}

  get audioRequirements(): string | undefined {
    return this.props.audioRequirements;
  }

  get lightingRequirements(): string | undefined {
    return this.props.lightingRequirements;
  }

  get visualRequirements(): string | undefined {
    return this.props.visualRequirements;
  }

  get stageConfiguration(): string | undefined {
    return this.props.stageConfiguration;
  }

  get requiresTechnician(): boolean {
    return this.props.requiresTechnician;
  }

  // Helper to merge or update instructions
  public update(props: Partial<ProductionRiderProps>): ProductionRider {
    return new ProductionRider({
      ...this.props,
      ...props,
    });
  }

  public toJSON(): ProductionRiderProps {
    return { ...this.props };
  }
}
