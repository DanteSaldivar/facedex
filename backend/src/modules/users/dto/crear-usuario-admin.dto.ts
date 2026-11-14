import { IsNotEmpty, IsString, IsEmail, MinLength, Matches, MaxLength, IsDateString, IsIn, } from 'class-validator';

export class CrearUsuarioAdminDto {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString()
    nombre?: string;

    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    @IsString()
    apellido?: string;

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe ser un email válido' })
    correo?: string;

    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    @MaxLength(20, { message: 'El nombre de usuario no puede tener más de 20 caracteres' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'El nombre de usuario solo puede contener letras, números y guión bajo',
    })
    nombreUsuario?: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'La contraseña debe tener al menos una letra mayúscula y un número',
    })
    password?: string;

    @IsNotEmpty({ message: 'Debes repetir la contraseña' })
    repetirPassword?: string;
    
    @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
    @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
    fechaNacimiento?: string;

    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
    descripcion?: string;

    @IsNotEmpty({ message: 'El perfil es obligatorio' })
    @IsIn(['usuario', 'administrador'], {
        message: 'El perfil debe ser "usuario" o "administrador"',
    })
    perfil?: 'usuario' | 'administrador';
}