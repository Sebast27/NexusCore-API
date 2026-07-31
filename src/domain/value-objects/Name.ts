// domain/value-objects/Name.ts
export class Name {
  private readonly value: string;
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;
  private static readonly NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Name {
    if (!value || value.trim() === '') {
      throw new Error('Name cannot be empty');
    }

    const trimmed = value.trim();

    if (trimmed.length < Name.MIN_LENGTH) {
      throw new Error(`Name must be at least ${Name.MIN_LENGTH} characters`);
    }

    if (trimmed.length > Name.MAX_LENGTH) {
      throw new Error(`Name cannot exceed ${Name.MAX_LENGTH} characters`);
    }

    if (!Name.NAME_REGEX.test(trimmed)) {
      throw new Error('Name contains invalid characters. Only letters and spaces allowed');
    }

    // ✅ CORREGIDO: Capitalizar correctamente con acentos
    const formatted = trimmed
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        // Capitalizar primera letra respetando acentos
        return word.charAt(0).toLocaleUpperCase() + word.slice(1);
      })
      .join(' ');

    return new Name(formatted);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Name): boolean {
    return this.value === other.value;
  }

  getInitials(): string {
    return this.value
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getFirstName(): string {
    return this.value.split(' ')[0];
  }

  getLastName(): string {
    const parts = this.value.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
}